import "server-only";

import Stripe from "stripe";
import type { BillingSubscriptionStatus, Prisma } from "@prisma/client";
import {
  billingConfig,
  getApprovedPriceId,
  isControlledBillingTestUser,
  isApprovedStripePriceId,
  isCheckoutAvailable,
  type BillingInterval
} from "@/config/billing";
import { analyticsEvents, recordAnalyticsEvent } from "@/lib/analytics";
import { appUrl } from "@/lib/email";
import { getPrisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getProductAccess, recordBillingEvent } from "@/lib/billing";

export function stripeStatusToBillingStatus(status?: Stripe.Subscription.Status | null): BillingSubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "incomplete":
      return "INCOMPLETE";
    case "incomplete_expired":
      return "INCOMPLETE_EXPIRED";
    case "unpaid":
      return "UNPAID";
    case "paused":
      return "PAUSED";
    default:
      return "CONFIGURATION_ONLY";
  }
}

function toDate(seconds?: number | null) {
  return seconds ? new Date(seconds * 1000) : null;
}

async function getOrCreateStripeCustomer(user: { id: string; email?: string | null; name?: string | null }) {
  const prisma = getPrisma();
  const existing = await prisma.subscription.findFirst({
    where: { userId: user.id, stripeCustomerId: { not: null } },
    orderBy: { updatedAt: "desc" }
  });

  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    metadata: {
      businessNextUserId: user.id
    }
  });

  await prisma.subscription.upsert({
    where: { id: existing?.id ?? `subscription-${user.id}` },
    create: {
      id: `subscription-${user.id}`,
      userId: user.id,
      stripeCustomerId: customer.id,
      status: "customer-created",
      billingStatus: "CONFIGURATION_ONLY"
    },
    update: {
      stripeCustomerId: customer.id
    }
  });

  return customer.id;
}

export async function createCheckoutSession({
  user,
  interval
}: {
  user: { id: string; email?: string | null; name?: string | null };
  interval: BillingInterval;
}) {
  if (!isCheckoutAvailable()) {
    throw new Error("Checkout is not enabled because Business Next pricing has not been approved.");
  }
  if (!isControlledBillingTestUser(user.email)) {
    throw new Error("Checkout is limited to the approved test account until public launch is approved.");
  }

  const priceId = getApprovedPriceId(interval);
  if (!priceId) {
    throw new Error("This billing interval is not available.");
  }

  const access = await getProductAccess(user.id);
  if (access.allowed && access.source !== "BILLING_NOT_LIVE") {
    throw new Error("This account already has product access.");
  }

  const prisma = getPrisma();
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      billingStatus: { in: ["ACTIVE", "TRIALING", "PAST_DUE", "INCOMPLETE"] },
      stripeSubscriptionId: { not: null }
    }
  });

  if (activeSubscription) {
    throw new Error("This account already has a subscription in Stripe. Use the billing portal instead.");
  }

  const customerId = await getOrCreateStripeCustomer(user);
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: appUrl("/app/billing/success?session_id={CHECKOUT_SESSION_ID}"),
    cancel_url: appUrl("/pricing?checkout=cancelled"),
    allow_promotion_codes: false,
    metadata: {
      businessNextUserId: user.id,
      planId: billingConfig.plan.id,
      interval
    },
    subscription_data: {
      metadata: {
        businessNextUserId: user.id,
        planId: billingConfig.plan.id
      }
    }
  });

  await recordBillingEvent({
    userId: user.id,
    type: "CHECKOUT_STARTED",
    summary: "Stripe Checkout session created.",
    stripeCustomerId: customerId,
    metadata: { interval }
  });
  await recordAnalyticsEvent({
    userId: user.id,
    name: analyticsEvents.checkoutStarted,
    path: "/app/billing",
    metadata: { interval }
  });

  return session.url;
}

export async function createCustomerPortalSession(userId: string) {
  const prisma = getPrisma();
  const subscription = await prisma.subscription.findFirst({
    where: { userId, stripeCustomerId: { not: null } },
    orderBy: { updatedAt: "desc" }
  });

  if (!subscription?.stripeCustomerId) {
    throw new Error("No Stripe customer is linked to this account yet.");
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: appUrl("/app/billing")
  });

  await recordBillingEvent({
    userId,
    type: "CUSTOMER_PORTAL_OPENED",
    summary: "Customer Portal session created.",
    stripeCustomerId: subscription.stripeCustomerId
  });
  await recordAnalyticsEvent({
    userId,
    name: analyticsEvents.customerPortalOpened,
    path: "/app/billing"
  });

  return session.url;
}

function objectKind(object: Stripe.Event.Data.Object) {
  return (object as { object?: string }).object;
}

function subscriptionFromEventObject(object: Stripe.Event.Data.Object) {
  if (objectKind(object) === "subscription") return object as Stripe.Subscription;
  return null;
}

function invoiceFromEventObject(object: Stripe.Event.Data.Object) {
  if (objectKind(object) === "invoice") return object as Stripe.Invoice;
  return null;
}

function checkoutSessionFromEventObject(object: Stripe.Event.Data.Object) {
  if (objectKind(object) === "checkout.session") return object as Stripe.Checkout.Session;
  return null;
}

async function findUserIdFromStripe({
  customerId,
  subscriptionId,
  metadataUserId
}: {
  customerId?: string | null;
  subscriptionId?: string | null;
  metadataUserId?: string | null;
}) {
  if (metadataUserId) return metadataUserId;

  const subscription = await getPrisma().subscription.findFirst({
    where: {
      OR: [
        ...(customerId ? [{ stripeCustomerId: customerId }] : []),
        ...(subscriptionId ? [{ stripeSubscriptionId: subscriptionId }] : [])
      ]
    },
    select: { userId: true }
  });

  return subscription?.userId ?? null;
}

async function syncSubscriptionFromStripe({
  userId,
  stripeSubscription,
  stripeEventId
}: {
  userId: string;
  stripeSubscription: Stripe.Subscription;
  stripeEventId: string;
}) {
  const item = stripeSubscription.items.data[0];
  const price = item?.price;
  if (!isApprovedStripePriceId(price?.id)) {
    throw new Error("Stripe subscription price is not approved for this test-mode launch phase.");
  }

  const currentPeriodEnd = item?.current_period_end;
  const billingInterval = price?.recurring?.interval === "year" ? "ANNUAL" : "MONTHLY";
  const billingStatus = stripeStatusToBillingStatus(stripeSubscription.status);
  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer.id;

  await getPrisma().subscription.upsert({
    where: { stripeSubscriptionId: stripeSubscription.id },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: price?.id,
      stripeProductId: typeof price?.product === "string" ? price.product : price?.product?.id,
      status: stripeSubscription.status,
      billingStatus,
      billingInterval,
      currentPeriodEnd: toDate(currentPeriodEnd),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      trialStart: toDate(stripeSubscription.trial_start),
      trialEnd: toDate(stripeSubscription.trial_end),
      purchasedAt: billingStatus === "ACTIVE" || billingStatus === "TRIALING" ? new Date() : null,
      cancelledAt: toDate(stripeSubscription.canceled_at),
      endedAt: toDate(stripeSubscription.ended_at),
      latestStripeEventId: stripeEventId
    },
    update: {
      stripeCustomerId: customerId,
      stripePriceId: price?.id,
      stripeProductId: typeof price?.product === "string" ? price.product : price?.product?.id,
      status: stripeSubscription.status,
      billingStatus,
      billingInterval,
      currentPeriodEnd: toDate(currentPeriodEnd),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      trialStart: toDate(stripeSubscription.trial_start),
      trialEnd: toDate(stripeSubscription.trial_end),
      cancelledAt: toDate(stripeSubscription.canceled_at),
      endedAt: toDate(stripeSubscription.ended_at),
      latestStripeEventId: stripeEventId
    }
  });

  if (billingStatus === "ACTIVE" || billingStatus === "TRIALING") {
    await getPrisma().userEntitlement.upsert({
      where: {
        userId_kind_source: {
          userId,
          kind: billingStatus === "TRIALING" ? "TRIAL" : "PAID",
          source: stripeSubscription.id
        }
      },
      create: {
        userId,
        kind: billingStatus === "TRIALING" ? "TRIAL" : "PAID",
        status: "ACTIVE",
        reason: "Verified Stripe subscription state.",
        source: stripeSubscription.id,
        endsAt: toDate(currentPeriodEnd)
      },
      update: {
        status: "ACTIVE",
        endsAt: toDate(currentPeriodEnd)
      }
    });
  }

  if (billingStatus === "CANCELED" || billingStatus === "UNPAID" || billingStatus === "INCOMPLETE_EXPIRED") {
    await getPrisma().userEntitlement.updateMany({
      where: { userId, source: stripeSubscription.id, kind: { in: ["PAID", "TRIAL"] } },
      data: { status: "INACTIVE", endsAt: new Date() }
    });
  }

  return { billingStatus, customerId, subscriptionId: stripeSubscription.id };
}

export async function processStripeEvent(event: Stripe.Event) {
  const prisma = getPrisma();
  const existing = await prisma.stripeWebhookEvent.findUnique({ where: { id: event.id } });
  if (existing) {
    return { duplicate: true, summary: existing.summary };
  }
  if (event.livemode) {
    await prisma.stripeWebhookEvent.create({
      data: {
        id: event.id,
        type: event.type,
        livemode: event.livemode,
        processingStatus: "failed",
        summary: "Live-mode Stripe webhook rejected.",
        errorMessage: "Stripe live mode is disabled for the controlled test-mode launch phase.",
        payload: event as unknown as Prisma.InputJsonValue
      }
    });
    await recordBillingEvent({
      type: "WEBHOOK_FAILED",
      stripeEventId: event.id,
      summary: "Live-mode Stripe webhook rejected."
    });
    throw new Error("Stripe live mode is disabled for the controlled test-mode launch phase.");
  }

  let userId: string | null = null;
  let stripeCustomerId: string | null = null;
  let stripeSubscriptionId: string | null = null;
  let summary = "Stripe event recorded.";
  let billingEventType: Prisma.BillingEventCreateInput["type"] = "WEBHOOK_IGNORED";

  const subscription = subscriptionFromEventObject(event.data.object);
  const invoice = invoiceFromEventObject(event.data.object);
  const checkoutSession = checkoutSessionFromEventObject(event.data.object);

  try {
    if (checkoutSession) {
      stripeCustomerId = typeof checkoutSession.customer === "string" ? checkoutSession.customer : checkoutSession.customer?.id ?? null;
      stripeSubscriptionId =
        typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : checkoutSession.subscription?.id ?? null;
      userId = await findUserIdFromStripe({
        customerId: stripeCustomerId,
        subscriptionId: stripeSubscriptionId,
        metadataUserId: checkoutSession.metadata?.businessNextUserId
      });
      summary = "Checkout completed; waiting for verified subscription state.";
      billingEventType = "CHECKOUT_COMPLETED";
    }

    if (subscription) {
      stripeSubscriptionId = subscription.id;
      stripeCustomerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      userId = await findUserIdFromStripe({
        customerId: stripeCustomerId,
        subscriptionId: stripeSubscriptionId,
        metadataUserId: subscription.metadata?.businessNextUserId
      });
      if (!userId) throw new Error("Could not associate Stripe subscription with a Business Next user.");

      const synced = await syncSubscriptionFromStripe({ userId, stripeSubscription: subscription, stripeEventId: event.id });
      summary = `Subscription reconciled as ${synced.billingStatus}.`;
      billingEventType =
        event.type === "customer.subscription.created"
          ? "SUBSCRIPTION_CREATED"
          : event.type === "customer.subscription.deleted"
            ? "SUBSCRIPTION_CANCELLED"
            : "SUBSCRIPTION_UPDATED";

      if (synced.billingStatus === "ACTIVE") {
        await recordAnalyticsEvent({ userId, name: analyticsEvents.subscriptionActivated, path: "/app/billing" });
      }
      if (subscription.cancel_at_period_end) {
        await recordAnalyticsEvent({ userId, name: analyticsEvents.cancellationScheduled, path: "/app/billing" });
      }
      if (synced.billingStatus === "CANCELED") {
        await recordAnalyticsEvent({ userId, name: analyticsEvents.subscriptionEnded, path: "/app/billing" });
      }
    }

    if (invoice) {
      stripeCustomerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
      stripeSubscriptionId = null;
      userId = await findUserIdFromStripe({ customerId: stripeCustomerId, subscriptionId: stripeSubscriptionId });
      summary = event.type === "invoice.payment_failed" ? "Invoice payment failed." : "Invoice payment succeeded.";
      billingEventType = event.type === "invoice.payment_failed" ? "INVOICE_PAYMENT_FAILED" : "INVOICE_PAYMENT_SUCCEEDED";
    }

    if (event.type === "charge.refunded" || event.type === "charge.dispute.created") {
      summary = "Refund or payment reversal event recorded for review.";
      billingEventType = "REFUND_OR_REVERSAL";
    }

    await prisma.stripeWebhookEvent.create({
      data: {
        id: event.id,
        type: event.type,
        livemode: event.livemode,
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        summary,
        payload: event as unknown as Prisma.InputJsonValue
      }
    });

    await recordBillingEvent({
      userId,
      type: billingEventType,
      stripeEventId: event.id,
      stripeCustomerId,
      stripeSubscriptionId,
      summary
    });

    return { duplicate: false, summary };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook processing error.";
    await prisma.stripeWebhookEvent.create({
      data: {
        id: event.id,
        type: event.type,
        livemode: event.livemode,
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        processingStatus: "failed",
        summary: "Webhook processing failed.",
        errorMessage: message
      }
    });
    await recordBillingEvent({
      userId,
      type: "WEBHOOK_FAILED",
      stripeEventId: event.id,
      stripeCustomerId,
      stripeSubscriptionId,
      summary: message
    });
    throw error;
  }
}
