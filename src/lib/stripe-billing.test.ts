import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getProductAccess: vi.fn(),
  recordBillingEvent: vi.fn(),
  recordAnalyticsEvent: vi.fn(),
  stripeCustomerCreate: vi.fn(),
  stripeCheckoutCreate: vi.fn(),
  stripePortalCreate: vi.fn(),
  prisma: {
    subscription: {
      findFirst: vi.fn(),
      upsert: vi.fn()
    },
    userEntitlement: {
      upsert: vi.fn(),
      updateMany: vi.fn()
    },
    stripeWebhookEvent: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
  }
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/billing", () => ({
  getProductAccess: mocks.getProductAccess,
  recordBillingEvent: mocks.recordBillingEvent
}));

vi.mock("@/lib/analytics", () => ({
  analyticsEvents: {
    checkoutStarted: "CHECKOUT_STARTED",
    customerPortalOpened: "CUSTOMER_PORTAL_OPENED",
    subscriptionActivated: "SUBSCRIPTION_ACTIVATED",
    cancellationScheduled: "CANCELLATION_SCHEDULED",
    subscriptionEnded: "SUBSCRIPTION_ENDED"
  },
  recordAnalyticsEvent: mocks.recordAnalyticsEvent
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => mocks.prisma
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    customers: { create: mocks.stripeCustomerCreate },
    checkout: { sessions: { create: mocks.stripeCheckoutCreate } },
    billingPortal: { sessions: { create: mocks.stripePortalCreate } }
  })
}));

function resetBillingEnv() {
  process.env.BUSINESS_NEXT_BILLING_ENABLED = "false";
  delete process.env.BUSINESS_NEXT_STRIPE_MODE;
  process.env.STRIPE_SECRET_KEY = "sk_test_123";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  delete process.env.STRIPE_PRICE_ID_MONTHLY;
  delete process.env.STRIPE_TEST_PRICE_ID_MONTHLY;
  delete process.env.STRIPE_TEST_PRODUCT_ID;
  delete process.env.STRIPE_TEST_PRICE_ID_ANNUAL;
  delete process.env.STRIPE_LIVE_PRICE_ID_MONTHLY;
  delete process.env.STRIPE_LIVE_PRODUCT_ID;
  delete process.env.VERCEL_ENV;
  delete process.env.BUSINESS_NEXT_APPROVED_APP_URL;
  delete process.env.BUSINESS_NEXT_LEGAL_OWNER_ACCEPTED;
  delete process.env.BUSINESS_NEXT_TERMS_VERSION_ACCEPTED;
  delete process.env.BUSINESS_NEXT_PRIVACY_VERSION_ACCEPTED;
  delete process.env.BUSINESS_NEXT_SUBSCRIPTION_TERMS_VERSION_ACCEPTED;
}

function setLiveBillingEnv() {
  process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
  process.env.BUSINESS_NEXT_STRIPE_MODE = "live";
  process.env.STRIPE_SECRET_KEY = "sk_live_123";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_live";
  process.env.STRIPE_LIVE_PRODUCT_ID = "prod_live";
  process.env.STRIPE_LIVE_PRICE_ID_MONTHLY = "price_live_monthly";
  process.env.BUSINESS_NEXT_APPROVED_APP_URL = "https://businesssorted.uk";
  process.env.VERCEL_ENV = "production";
  process.env.BUSINESS_NEXT_LEGAL_OWNER_ACCEPTED = "true";
  process.env.BUSINESS_NEXT_TERMS_VERSION_ACCEPTED = "1.0";
  process.env.BUSINESS_NEXT_PRIVACY_VERSION_ACCEPTED = "1.0";
  process.env.BUSINESS_NEXT_SUBSCRIPTION_TERMS_VERSION_ACCEPTED = "1.0";
}

function subscriptionEvent({
  id = "evt_test",
  status = "active",
  priceId = "price_test_monthly",
  productId = "prod_test",
  livemode = false,
  cancelAtPeriodEnd = false
}: {
  id?: string;
  status?: Stripe.Subscription.Status;
  priceId?: string;
  productId?: string;
  livemode?: boolean;
  cancelAtPeriodEnd?: boolean;
} = {}) {
  return {
    id,
    type: status === "canceled" ? "customer.subscription.deleted" : "customer.subscription.updated",
    livemode,
    data: {
      object: {
        id: "sub_test",
        object: "subscription",
        status,
        customer: "cus_test",
        cancel_at_period_end: cancelAtPeriodEnd,
        canceled_at: status === "canceled" ? 1_720_000_000 : null,
        ended_at: status === "canceled" ? 1_720_000_000 : null,
        trial_start: status === "trialing" ? 1_719_900_000 : null,
        trial_end: status === "trialing" ? 1_720_500_000 : null,
        metadata: { businessNextUserId: "user_1" },
        items: {
          data: [
            {
              current_period_end: 1_720_500_000,
              price: {
                id: priceId,
                product: productId,
                recurring: { interval: "month" }
              }
            }
          ]
        }
      }
    }
  } as unknown as Stripe.Event;
}

describe("Stripe billing helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetBillingEnv();
    mocks.getProductAccess.mockResolvedValue({ allowed: false, source: "NONE", message: "Choose a plan." });
    mocks.recordAnalyticsEvent.mockResolvedValue(undefined);
    mocks.recordBillingEvent.mockResolvedValue(undefined);
    mocks.prisma.subscription.findFirst.mockResolvedValue(null);
    mocks.prisma.subscription.upsert.mockResolvedValue({});
    mocks.prisma.userEntitlement.upsert.mockResolvedValue({});
    mocks.prisma.userEntitlement.updateMany.mockResolvedValue({ count: 1 });
    mocks.prisma.stripeWebhookEvent.findUnique.mockResolvedValue(null);
    mocks.prisma.stripeWebhookEvent.create.mockResolvedValue({});
    mocks.prisma.stripeWebhookEvent.update.mockResolvedValue({});
    mocks.stripeCustomerCreate.mockResolvedValue({ id: "cus_test" });
    mocks.stripeCheckoutCreate.mockResolvedValue({ url: "https://checkout.stripe.test/session" });
    mocks.stripePortalCreate.mockResolvedValue({ url: "https://billing.stripe.test/session" });
  });

  it("maps Stripe subscription statuses to local access statuses", async () => {
    const { stripeStatusToBillingStatus } = await import("./stripe-billing");

    expect(stripeStatusToBillingStatus("active")).toBe("ACTIVE");
    expect(stripeStatusToBillingStatus("trialing")).toBe("TRIALING");
    expect(stripeStatusToBillingStatus("past_due")).toBe("PAST_DUE");
    expect(stripeStatusToBillingStatus("canceled")).toBe("CANCELED");
  });

  it("refuses to create Checkout when test pricing is not approved", async () => {
    const { createCheckoutSession } = await import("./stripe-billing");

    await expect(
      createCheckoutSession({
        user: { id: "user_1", email: "founder@example.com" },
        interval: "monthly"
      })
    ).rejects.toThrow("Checkout is not enabled");
    expect(mocks.stripeCheckoutCreate).not.toHaveBeenCalled();
  });

  it("ignores legacy generic price variables during the test-mode launch phase", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_PRICE_ID_MONTHLY = "price_live_or_legacy";

    const { createCheckoutSession } = await import("./stripe-billing");

    await expect(
      createCheckoutSession({
        user: { id: "user_1", email: "founder@example.com" },
        interval: "monthly"
      })
    ).rejects.toThrow("Checkout is not enabled");
    expect(mocks.stripeCheckoutCreate).not.toHaveBeenCalled();
  });

  it("starts Checkout only with the configured test price ID", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";

    const { createCheckoutSession } = await import("./stripe-billing");

    await expect(
      createCheckoutSession({
        user: { id: "user_1", email: "founder@example.com" },
        interval: "monthly"
      })
    ).resolves.toBe("https://checkout.stripe.test/session");
    expect(mocks.stripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_test_monthly", quantity: 1 }]
      })
    );
  });

  it("allows configured Checkout for ordinary users after public launch", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";

    const { createCheckoutSession } = await import("./stripe-billing");

    await expect(
      createCheckoutSession({
        user: { id: "user_1", email: "ordinary@example.com" },
        interval: "monthly"
      })
    ).resolves.toBe("https://checkout.stripe.test/session");
    expect(mocks.stripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_test_monthly", quantity: 1 }]
      })
    );
  });

  it("starts live Checkout for any verified user with the approved live monthly price", async () => {
    setLiveBillingEnv();

    const { createCheckoutSession } = await import("./stripe-billing");

    await expect(
      createCheckoutSession({
        user: { id: "user_1", email: "customer@example.com" },
        interval: "monthly"
      })
    ).resolves.toBe("https://checkout.stripe.test/session");
    expect(mocks.stripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_live_monthly", quantity: 1 }]
      })
    );
  });

  it("rejects annual Checkout when no annual test price is approved", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";

    const { createCheckoutSession } = await import("./stripe-billing");

    await expect(
      createCheckoutSession({
        user: { id: "user_1", email: "founder@example.com" },
        interval: "annual"
      })
    ).rejects.toThrow("This billing interval is not available");
    expect(mocks.stripeCheckoutCreate).not.toHaveBeenCalled();
  });

  it("opens Customer Portal only for an existing Stripe customer", async () => {
    mocks.prisma.subscription.findFirst.mockResolvedValue({ stripeCustomerId: "cus_test" });

    const { createCustomerPortalSession } = await import("./stripe-billing");

    await expect(createCustomerPortalSession("user_1")).resolves.toBe("https://billing.stripe.test/session");
    expect(mocks.stripePortalCreate).toHaveBeenCalledWith({
      customer: "cus_test",
      return_url: expect.stringContaining("/app/billing")
    });
  });

  it("rejects live-mode webhook events when configured for test mode", async () => {
    const { processStripeEvent } = await import("./stripe-billing");

    await expect(processStripeEvent(subscriptionEvent({ id: "evt_live", livemode: true }))).rejects.toThrow(
      "Stripe webhook livemode did not match"
    );
    expect(mocks.prisma.userEntitlement.upsert).not.toHaveBeenCalled();
    expect(mocks.prisma.stripeWebhookEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          processingStatus: "failed",
          summary: "Stripe webhook mode rejected."
        })
      })
    );
  });

  it("rejects test-mode webhook events when configured for live mode", async () => {
    setLiveBillingEnv();

    const { processStripeEvent } = await import("./stripe-billing");

    await expect(
      processStripeEvent(subscriptionEvent({ id: "evt_test_in_live", priceId: "price_live_monthly", livemode: false }))
    ).rejects.toThrow("Stripe webhook livemode did not match");
    expect(mocks.prisma.userEntitlement.upsert).not.toHaveBeenCalled();
  });

  it("treats repeated webhook ids as idempotent duplicates", async () => {
    mocks.prisma.stripeWebhookEvent.findUnique.mockResolvedValue({ summary: "Already processed." });

    const { processStripeEvent } = await import("./stripe-billing");

    await expect(processStripeEvent(subscriptionEvent())).resolves.toEqual({
      duplicate: true,
      summary: "Already processed."
    });
    expect(mocks.prisma.subscription.upsert).not.toHaveBeenCalled();
  });

  it("reprocesses a previously failed webhook event instead of skipping it as a duplicate", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";
    mocks.prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      id: "evt_test",
      processingStatus: "failed",
      summary: "Webhook processing failed."
    });

    const { processStripeEvent } = await import("./stripe-billing");

    await expect(processStripeEvent(subscriptionEvent())).resolves.toEqual({
      duplicate: false,
      summary: "Subscription reconciled as ACTIVE."
    });
    expect(mocks.prisma.subscription.upsert).toHaveBeenCalled();
    expect(mocks.prisma.stripeWebhookEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "evt_test" },
        data: expect.objectContaining({
          processingStatus: "processed",
          errorMessage: null,
          summary: "Subscription reconciled as ACTIVE."
        })
      })
    );
    expect(mocks.prisma.stripeWebhookEvent.create).not.toHaveBeenCalled();
  });

  it("activates access from an approved test subscription price", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";

    const { processStripeEvent } = await import("./stripe-billing");

    await expect(processStripeEvent(subscriptionEvent())).resolves.toEqual({
      duplicate: false,
      summary: "Subscription reconciled as ACTIVE."
    });
    expect(mocks.prisma.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          billingStatus: "ACTIVE",
          stripePriceId: "price_test_monthly"
        })
      })
    );
    expect(mocks.prisma.userEntitlement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          kind: "PAID",
          status: "ACTIVE"
        })
      })
    );
  });

  it("updates an existing Stripe customer row when a subscription webhook arrives", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";
    mocks.prisma.subscription.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "subscription-user_1" });

    const { processStripeEvent } = await import("./stripe-billing");

    await expect(processStripeEvent(subscriptionEvent())).resolves.toEqual({
      duplicate: false,
      summary: "Subscription reconciled as ACTIVE."
    });
    const upsertCall = mocks.prisma.subscription.upsert.mock.calls[0]?.[0];
    expect(upsertCall.where).toEqual({ id: "subscription-user_1" });
    expect(upsertCall.update).toEqual(
      expect.objectContaining({
        billingStatus: "ACTIVE",
        stripeCustomerId: "cus_test",
        stripeSubscriptionId: "sub_test",
        stripePriceId: "price_test_monthly"
      })
    );
  });

  it("activates access from an approved live subscription price in live mode", async () => {
    setLiveBillingEnv();

    const { processStripeEvent } = await import("./stripe-billing");

    await expect(
      processStripeEvent(
        subscriptionEvent({
          id: "evt_live_active",
          priceId: "price_live_monthly",
          productId: "prod_live",
          livemode: true
        })
      )
    ).resolves.toEqual({
      duplicate: false,
      summary: "Subscription reconciled as ACTIVE."
    });
    expect(mocks.prisma.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          billingStatus: "ACTIVE",
          stripePriceId: "price_live_monthly"
        })
      })
    );
    expect(mocks.prisma.userEntitlement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          kind: "PAID",
          status: "ACTIVE"
        })
      })
    );
  });

  it("rejects subscription activation from an unapproved price ID", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";

    const { processStripeEvent } = await import("./stripe-billing");

    await expect(processStripeEvent(subscriptionEvent({ priceId: "price_unapproved" }))).rejects.toThrow(
      "Stripe subscription price is not approved"
    );
    expect(mocks.prisma.userEntitlement.upsert).not.toHaveBeenCalled();
  });

  it("rejects subscription activation from an unapproved product ID in live mode", async () => {
    setLiveBillingEnv();

    const { processStripeEvent } = await import("./stripe-billing");

    await expect(
      processStripeEvent(
        subscriptionEvent({
          id: "evt_wrong_product",
          priceId: "price_live_monthly",
          productId: "prod_wrong",
          livemode: true
        })
      )
    ).rejects.toThrow("Stripe subscription product is not approved");
    expect(mocks.prisma.userEntitlement.upsert).not.toHaveBeenCalled();
  });

  it("records failed payments without sending emails", async () => {
    mocks.prisma.subscription.findFirst.mockResolvedValue({ userId: "user_1" });
    const invoiceEvent = {
      id: "evt_invoice_failed",
      type: "invoice.payment_failed",
      livemode: false,
      data: {
        object: {
          object: "invoice",
          customer: "cus_test"
        }
      }
    } as unknown as Stripe.Event;

    const { processStripeEvent } = await import("./stripe-billing");

    await expect(processStripeEvent(invoiceEvent)).resolves.toEqual({
      duplicate: false,
      summary: "Invoice payment failed."
    });
    expect(mocks.recordBillingEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "INVOICE_PAYMENT_FAILED",
        userId: "user_1"
      })
    );
    expect(mocks.prisma.userEntitlement.upsert).not.toHaveBeenCalled();
  });

  it("removes paid or trial entitlement when a subscription ends", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";

    const { processStripeEvent } = await import("./stripe-billing");

    await expect(processStripeEvent(subscriptionEvent({ id: "evt_cancelled", status: "canceled" }))).resolves.toEqual({
      duplicate: false,
      summary: "Subscription reconciled as CANCELED."
    });
    expect(mocks.prisma.userEntitlement.updateMany).toHaveBeenCalledWith({
      where: { userId: "user_1", source: "sub_test", kind: { in: ["PAID", "TRIAL"] } },
      data: { status: "INACTIVE", endsAt: expect.any(Date) }
    });
  });
  it.each(["active", "canceled"] as const)("ignores an unrelated %s subscription without changing access", async (status) => {
    setLiveBillingEnv();
    const event = subscriptionEvent({ status, livemode: true, priceId: "price_other", productId: "prod_other" });
    (event.data.object as Stripe.Subscription).metadata = { user_id: "other-app-user", plan: "pro_creator" };
    const { processStripeEvent } = await import("./stripe-billing");

    await expect(processStripeEvent(event)).resolves.toEqual({ duplicate: false, summary: "Ignored subscription outside Business Sorted." });
    expect(mocks.prisma.subscription.findFirst).toHaveBeenCalledTimes(1);
    expect(mocks.prisma.subscription.findFirst).toHaveBeenCalledWith({ where: { stripeSubscriptionId: "sub_test" }, select: { userId: true } });
    expect(mocks.prisma.subscription.upsert).not.toHaveBeenCalled();
    expect(mocks.prisma.userEntitlement.upsert).not.toHaveBeenCalled();
    expect(mocks.prisma.userEntitlement.updateMany).not.toHaveBeenCalled();
    expect(mocks.recordAnalyticsEvent).not.toHaveBeenCalled();
    expect(mocks.recordBillingEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "WEBHOOK_IGNORED", userId: null }));
  });

  it("recovers previously failed unrelated events as ignored", async () => {
    setLiveBillingEnv();
    mocks.prisma.stripeWebhookEvent.findUnique.mockResolvedValue({ processingStatus: "failed" });
    const event = subscriptionEvent({ status: "canceled", livemode: true, priceId: "price_other", productId: "prod_other" });
    (event.data.object as Stripe.Subscription).metadata = {};
    const { processStripeEvent } = await import("./stripe-billing");
    await processStripeEvent(event);
    expect(mocks.prisma.stripeWebhookEvent.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ processingStatus: "processed", errorMessage: null }) }));
    expect(mocks.prisma.userEntitlement.updateMany).not.toHaveBeenCalled();
  });

  it("keeps retrying an approved subscription with no matching user", async () => {
    setLiveBillingEnv();
    const event = subscriptionEvent({ status: "canceled", livemode: true, priceId: "price_live_monthly", productId: "prod_live" });
    (event.data.object as Stripe.Subscription).metadata = {};
    const { processStripeEvent } = await import("./stripe-billing");
    await expect(processStripeEvent(event)).rejects.toThrow("Could not associate Stripe subscription");
  });

  it("does not ignore an existing local subscription when its price is no longer approved", async () => {
    setLiveBillingEnv();
    mocks.prisma.subscription.findFirst.mockResolvedValue({ userId: "user_1" });
    const event = subscriptionEvent({ status: "canceled", livemode: true, priceId: "price_old", productId: "prod_live" });
    (event.data.object as Stripe.Subscription).metadata = {};
    const { processStripeEvent } = await import("./stripe-billing");
    await expect(processStripeEvent(event)).rejects.toThrow("Stripe subscription price is not approved");
  });

});
