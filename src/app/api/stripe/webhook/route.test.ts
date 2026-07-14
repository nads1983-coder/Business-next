import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: () => {
        throw new Error("bad signature");
      }
    }
  }),
  getStripeWebhookSecret: () => "whsec_test"
}));

vi.mock("@/lib/stripe-billing", () => ({
  processStripeEvent: vi.fn()
}));

describe("Stripe webhook route", () => {
  it("rejects requests without a Stripe signature", async () => {
    const { POST } = await import("./route");
    const response = await POST(new Request("https://example.com/api/stripe/webhook", { method: "POST", body: "{}" }));

    expect(response.status).toBe(400);
  });

  it("rejects invalid signatures before processing", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("https://example.com/api/stripe/webhook", {
        method: "POST",
        body: "{}",
        headers: { "stripe-signature": "bad" }
      })
    );

    expect(response.status).toBe(400);
  });
});
