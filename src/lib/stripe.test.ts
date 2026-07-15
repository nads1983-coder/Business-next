import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("Stripe client configuration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("rejects live secret keys during the controlled test-mode launch phase", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_blocked";

    const { getStripe } = await import("./stripe");

    expect(() => getStripe()).toThrow("Stripe live mode is disabled");
  });
});
