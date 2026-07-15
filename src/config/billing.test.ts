import { beforeEach, describe, expect, it, vi } from "vitest";

function resetBillingEnv() {
  process.env.BUSINESS_NEXT_BILLING_ENABLED = "false";
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_TEST_PRICE_ID_MONTHLY;
  delete process.env.STRIPE_TEST_PRICE_ID_ANNUAL;
  delete process.env.BUSINESS_NEXT_TEST_EMAIL;
}

describe("billing configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    resetBillingEnv();
  });

  it("defines the controlled MVP offer as monthly GBP with no annual plan or trial", async () => {
    const { billingConfig, getApprovedPriceId } = await import("./billing");

    expect(billingConfig.plan.name).toBe("Business Next");
    expect(billingConfig.plan.currency).toBe("gbp");
    expect(billingConfig.plan.displayPrice).toBe("£9 per month");
    expect(billingConfig.plan.monthlyPricePence).toBe(900);
    expect(billingConfig.plan.annualEnabled).toBe(false);
    expect(billingConfig.plan.trialDays).toBeUndefined();
    expect(getApprovedPriceId("annual")).toBeUndefined();
  });

  it("requires test-mode Stripe config before billing is ready", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_SECRET_KEY = "sk_test_ready";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_ready";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";
    process.env.BUSINESS_NEXT_TEST_EMAIL = "tester@example.com";

    const { isStripeTestModeReady, isControlledBillingTestUser } = await import("./billing");

    expect(isStripeTestModeReady()).toBe(true);
    expect(isControlledBillingTestUser("tester@example.com")).toBe(true);
    expect(isControlledBillingTestUser("ordinary@example.com")).toBe(false);
  });

  it("does not approve annual price IDs while annual billing is off", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_SECRET_KEY = "sk_test_ready";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_ready";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";
    process.env.STRIPE_TEST_PRICE_ID_ANNUAL = "price_test_annual";

    const { getApprovedStripePriceIds, isApprovedStripePriceId } = await import("./billing");

    expect(getApprovedStripePriceIds()).toEqual(["price_test_monthly"]);
    expect(isApprovedStripePriceId("price_test_monthly")).toBe(true);
    expect(isApprovedStripePriceId("price_test_annual")).toBe(false);
  });

  it("does not become ready with a live Stripe key", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.STRIPE_SECRET_KEY = "sk_live_blocked";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_ready";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";

    const { isStripeTestModeReady } = await import("./billing");

    expect(isStripeTestModeReady()).toBe(false);
  });
});
