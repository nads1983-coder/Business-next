import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/billing", () => ({
  getProductAccess: vi.fn(),
  recordBillingEvent: vi.fn()
}));

vi.mock("@/lib/analytics", () => ({
  analyticsEvents: {
    checkoutStarted: "CHECKOUT_STARTED",
    customerPortalOpened: "CUSTOMER_PORTAL_OPENED",
    subscriptionActivated: "SUBSCRIPTION_ACTIVATED",
    cancellationScheduled: "CANCELLATION_SCHEDULED",
    subscriptionEnded: "SUBSCRIPTION_ENDED"
  },
  recordAnalyticsEvent: vi.fn()
}));

describe("Stripe billing helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "false";
    delete process.env.STRIPE_PRICE_ID_MONTHLY;
  });

  it("maps Stripe subscription statuses to local access statuses", async () => {
    const { stripeStatusToBillingStatus } = await import("./stripe-billing");

    expect(stripeStatusToBillingStatus("active")).toBe("ACTIVE");
    expect(stripeStatusToBillingStatus("trialing")).toBe("TRIALING");
    expect(stripeStatusToBillingStatus("past_due")).toBe("PAST_DUE");
    expect(stripeStatusToBillingStatus("canceled")).toBe("CANCELED");
  });

  it("refuses to create Checkout when pricing is not approved", async () => {
    const { createCheckoutSession } = await import("./stripe-billing");

    await expect(
      createCheckoutSession({
        user: { id: "user_1", email: "founder@example.com" },
        interval: "monthly"
      })
    ).rejects.toThrow("Checkout is not enabled");
  });
});
