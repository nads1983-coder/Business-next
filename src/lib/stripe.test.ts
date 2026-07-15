import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

function resetStripeEnv() {
  delete process.env.BUSINESS_NEXT_STRIPE_MODE;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
}

describe("Stripe client configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    resetStripeEnv();
  });

  it("rejects live secret keys when Stripe mode is test", async () => {
    process.env.BUSINESS_NEXT_STRIPE_MODE = "test";
    process.env.STRIPE_SECRET_KEY = "sk_live_blocked";

    const { getStripe } = await import("./stripe");

    expect(() => getStripe()).toThrow("Stripe test mode requires a test secret key");
  });

  it("rejects test secret keys when Stripe mode is live", async () => {
    process.env.BUSINESS_NEXT_STRIPE_MODE = "live";
    process.env.STRIPE_SECRET_KEY = "sk_test_blocked";

    const { getStripe } = await import("./stripe");

    expect(() => getStripe()).toThrow("Stripe live mode requires a live secret key");
  });

  it("accepts live-shaped secret keys only when Stripe mode is live", async () => {
    process.env.BUSINESS_NEXT_STRIPE_MODE = "live";
    process.env.STRIPE_SECRET_KEY = "sk_live_ready";

    const { getStripe } = await import("./stripe");

    expect(() => getStripe()).not.toThrow();
  });

  it("requires a Stripe webhook signing secret", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "not_a_webhook_secret";

    const { getStripeWebhookSecret } = await import("./stripe");

    expect(() => getStripeWebhookSecret()).toThrow("STRIPE_WEBHOOK_SECRET must be a Stripe webhook signing secret");
  });
});
