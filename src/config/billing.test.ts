import { beforeEach, describe, expect, it, vi } from "vitest";

function resetBillingEnv() {
  process.env.BUSINESS_NEXT_BILLING_ENABLED = "false";
  delete process.env.BUSINESS_NEXT_STRIPE_MODE;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_TEST_PRICE_ID_MONTHLY;
  delete process.env.STRIPE_TEST_PRODUCT_ID;
  delete process.env.STRIPE_TEST_PRICE_ID_ANNUAL;
  delete process.env.STRIPE_LIVE_PRICE_ID_MONTHLY;
  delete process.env.STRIPE_LIVE_PRODUCT_ID;
  delete process.env.BUSINESS_NEXT_APPROVED_APP_URL;
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.NEXTAUTH_URL;
  delete process.env.BUSINESS_NEXT_TEST_EMAIL;
  delete process.env.BUSINESS_NEXT_LEGAL_OWNER_ACCEPTED;
  delete process.env.BUSINESS_NEXT_TERMS_VERSION_ACCEPTED;
  delete process.env.BUSINESS_NEXT_PRIVACY_VERSION_ACCEPTED;
  delete process.env.BUSINESS_NEXT_SUBSCRIPTION_TERMS_VERSION_ACCEPTED;
}

function setLiveReadyEnv() {
  process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
  process.env.BUSINESS_NEXT_STRIPE_MODE = "live";
  process.env.STRIPE_SECRET_KEY = "sk_live_ready";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_ready";
  process.env.STRIPE_LIVE_PRODUCT_ID = "prod_live";
  process.env.STRIPE_LIVE_PRICE_ID_MONTHLY = "price_live_monthly";
  process.env.BUSINESS_NEXT_APPROVED_APP_URL = "https://businesssorted.uk";
  process.env.BUSINESS_NEXT_TEST_EMAIL = "owner@example.com";
  process.env.BUSINESS_NEXT_LEGAL_OWNER_ACCEPTED = "true";
  process.env.BUSINESS_NEXT_TERMS_VERSION_ACCEPTED = "stage-3-live-owner-draft-2026-07-15";
  process.env.BUSINESS_NEXT_PRIVACY_VERSION_ACCEPTED = "stage-3-live-owner-draft-2026-07-15";
  process.env.BUSINESS_NEXT_SUBSCRIPTION_TERMS_VERSION_ACCEPTED =
    "stage-3-live-owner-draft-2026-07-15";
}

describe("billing configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    resetBillingEnv();
  });

  it("defines the controlled MVP offer as monthly GBP with no annual plan or trial", async () => {
    const { billingConfig, getApprovedPriceId } = await import("./billing");

    expect(billingConfig.plan.name).toBe("Business Sorted");
    expect(billingConfig.plan.currency).toBe("gbp");
    expect(billingConfig.plan.displayPrice).toBe("£9 per month");
    expect(billingConfig.plan.monthlyPricePence).toBe(900);
    expect(billingConfig.plan.annualEnabled).toBe(false);
    expect(billingConfig.plan.trialDays).toBeUndefined();
    expect(getApprovedPriceId("annual")).toBeUndefined();
  });

  it("uses one reviewed live owner draft version for all billing legal gates", async () => {
    const { billingConfig } = await import("./billing");
    const { legalVersion } = await import("./legal");

    expect(legalVersion).toBe("stage-3-live-owner-draft-2026-07-15");
    expect(billingConfig.legal.termsVersion).toBe(legalVersion);
    expect(billingConfig.legal.privacyVersion).toBe(legalVersion);
    expect(billingConfig.legal.subscriptionTermsVersion).toBe(legalVersion);
  });

  it("requires test-mode Stripe config before billing is ready", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.BUSINESS_NEXT_STRIPE_MODE = "test";
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

  it("does not become test-ready with a live Stripe key", async () => {
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "true";
    process.env.BUSINESS_NEXT_STRIPE_MODE = "test";
    process.env.STRIPE_SECRET_KEY = "sk_live_blocked";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_ready";
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";

    const { isStripeTestModeReady } = await import("./billing");

    expect(isStripeTestModeReady()).toBe(false);
  });

  it("requires explicit live mode, live key, live price, approved URL and owner legal acceptance for live readiness", async () => {
    setLiveReadyEnv();

    const {
      billingConfig,
      getApprovedPriceId,
      getCheckoutGateDiagnostics,
      isApprovedStripePriceId,
      isStripeLiveModeReady
    } = await import("./billing");

    expect(billingConfig.plan.stripeMode).toBe("live");
    expect(billingConfig.plan.stripeProductId).toBe("prod_live");
    expect(isStripeLiveModeReady()).toBe(true);
    expect(getCheckoutGateDiagnostics()).toEqual({ ready: true, failingCategories: [] });
    expect(getApprovedPriceId("monthly")).toBe("price_live_monthly");
    expect(getApprovedPriceId("annual")).toBeUndefined();
    expect(isApprovedStripePriceId("price_live_monthly")).toBe(true);
  });

  it("does not become live-ready with test prices or unapproved URLs", async () => {
    setLiveReadyEnv();
    process.env.STRIPE_TEST_PRICE_ID_MONTHLY = "price_test_monthly";
    process.env.BUSINESS_NEXT_APPROVED_APP_URL =
      "https://files-mentioned-by-the-user-build-umber.vercel.app";

    const { getCheckoutGateDiagnostics, isStripeLiveModeReady } = await import("./billing");

    expect(isStripeLiveModeReady()).toBe(false);
    expect(getCheckoutGateDiagnostics().failingCategories).toEqual(
      expect.arrayContaining(["approved_app_url", "mode_isolation"])
    );
  });

  it("requires lowercase true for live billing flags", async () => {
    setLiveReadyEnv();
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "TRUE";

    const { getCheckoutGateDiagnostics } = await import("./billing");
    expect(getCheckoutGateDiagnostics().failingCategories).toContain("billing_enabled");
  });

  it("requires current legal versions for live readiness", async () => {
    setLiveReadyEnv();
    process.env.BUSINESS_NEXT_TERMS_VERSION_ACCEPTED = "old";

    const { billingConfig, getCheckoutGateDiagnostics, isStripeLiveModeReady } = await import("./billing");

    expect(isStripeLiveModeReady()).toBe(false);
    expect(billingConfig.legal.requiresOwnerReview).toBe(true);
    expect(getCheckoutGateDiagnostics().failingCategories).toContain("legal_versions");
  });

  it("compares owner checkout email with trimming and casing normalization", async () => {
    process.env.BUSINESS_NEXT_TEST_EMAIL = "  Owner@Example.com ";

    const { isCheckoutOwnerEmail, isControlledBillingTestUser } = await import("./billing");
    expect(isCheckoutOwnerEmail("owner@example.com")).toBe(true);
    expect(isControlledBillingTestUser(" OWNER@example.com ")).toBe(true);
    expect(isCheckoutOwnerEmail("someone@example.com")).toBe(false);
  });
});
