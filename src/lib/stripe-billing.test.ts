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
      create: vi.fn()
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
  delete process.env.BUSINESS_NEXT_APPROVED_APP_URL;
  delete process.env.BUSINESS_NEXT_TEST_EMAIL;
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
  process.env.BUSINESS_NEXT_APPROVED_APP_URL = "https://businessnext.uk";
  process.env.BUSINESS_NEXT_TEST_EMAIL = "owner@example.com";
  process.env.BUSINESS_NEXT_LEGAL_OWNER_ACCEPTED = "true";
  process.env.BUSINESS_NEXT_TERMS_VERSION_ACCEPTED = "stage-3-live-owner-draft-2026-07-15";
  process.env.BUSINESS_NEXT_PRIVACY_VERSION_ACCEPTED = "stage-3-live-owner-draft-2026-07-15";
  process.env.BUSINESS_NEXT_SUBSCRIPTION_TERMS_VERSION_ACCEPTED = "stage-3-live-owner-draft-2026-07-15";
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
    process.env.BUSINESS_NEXT_TEST_EMAIL = "founder@example.com";

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

  it("blocks configured Checkout for users outside the approved test account", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";
    process.env.BUSINESS_NEXT_TEST_EMAIL = "approved@example.com";

    const { createCheckoutSession } = await import("./stripe-billing");

    await expect(
      createCheckoutSession({
        user: { id: "user_1", email: "ordinary@example.com" },
        interval: "monthly"
      })
    ).rejects.toThrow("Checkout is limited to the approved owner account");
    expect(mocks.stripeCheckoutCreate).not.toHaveBeenCalled();
  });

  it("starts live Checkout only for the configured owner email and live monthly price", async () => {
    setLiveBillingEnv();

    const { createCheckoutSession } = await import("./stripe-billing");

    await expect(
      createCheckoutSession({
        user: { id: "user_1", email: "owner@example.com" },
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
    process.env.BUSINESS_NEXT_TEST_EMAIL = "founder@example.com";

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
});
