import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const retrieve = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        retrieve
      }
    }
  })
}));

function checkoutSession({
  paymentStatus = "paid",
  status = "complete",
  priceId,
  productId,
  paymentLinkId,
  quantity = 1
}: {
  paymentStatus?: string;
  status?: string;
  priceId: string;
  productId: string;
  paymentLinkId: string;
  quantity?: number;
}) {
  return {
    payment_status: paymentStatus,
    status,
    payment_link: paymentLinkId,
    line_items: {
      data: [
        {
          quantity,
          price: {
            id: priceId,
            product: { id: productId }
          }
        }
      ]
    }
  };
}

describe("MTD delivery validation", () => {
  beforeEach(() => {
    retrieve.mockReset();
  });

  it("accepts a paid Starter Pack checkout session", async () => {
    retrieve.mockResolvedValue(
      checkoutSession({
        priceId: "price_1U2SXaFnoS3uqGtrB8VxL3n3",
        productId: "prod_V2XcEqFonhHpTf",
        paymentLinkId: "plink_1U2SY2FnoS3uqGtraeZpf74O"
      })
    );

    const { validateMtdCheckoutSession } = await import("./mtd-delivery");

    await expect(validateMtdCheckoutSession({ pack: "starter", sessionId: "cs_live_starter" })).resolves.toEqual({
      ok: true
    });
  });

  it("accepts a paid Setup Kit checkout session", async () => {
    retrieve.mockResolvedValue(
      checkoutSession({
        priceId: "price_1U2SXmFnoS3uqGtrFdikZkSn",
        productId: "prod_V2XcinA3qzIcyW",
        paymentLinkId: "plink_1U2SYFFnoS3uqGtrL8bvaCdQ"
      })
    );

    const { validateMtdCheckoutSession } = await import("./mtd-delivery");

    await expect(validateMtdCheckoutSession({ pack: "setup", sessionId: "cs_live_setup" })).resolves.toEqual({
      ok: true
    });
  });

  it("rejects missing or malformed session IDs", async () => {
    const { validateMtdCheckoutSession } = await import("./mtd-delivery");

    await expect(validateMtdCheckoutSession({ pack: "starter" })).resolves.toEqual({
      ok: false,
      reason: "missing"
    });
    await expect(validateMtdCheckoutSession({ pack: "starter", sessionId: "not-a-session" })).resolves.toEqual({
      ok: false,
      reason: "invalid"
    });
    expect(retrieve).not.toHaveBeenCalled();
  });

  it("rejects unpaid checkout sessions", async () => {
    retrieve.mockResolvedValue(
      checkoutSession({
        paymentStatus: "unpaid",
        status: "open",
        priceId: "price_1U2SXaFnoS3uqGtrB8VxL3n3",
        productId: "prod_V2XcEqFonhHpTf",
        paymentLinkId: "plink_1U2SY2FnoS3uqGtraeZpf74O"
      })
    );

    const { validateMtdCheckoutSession } = await import("./mtd-delivery");

    await expect(validateMtdCheckoutSession({ pack: "starter", sessionId: "cs_live_unpaid" })).resolves.toEqual({
      ok: false,
      reason: "unpaid"
    });
  });

  it("rejects incomplete checkout sessions", async () => {
    retrieve.mockResolvedValue(
      checkoutSession({
        paymentStatus: "paid",
        status: "open",
        priceId: "price_1U2SXaFnoS3uqGtrB8VxL3n3",
        productId: "prod_V2XcEqFonhHpTf",
        paymentLinkId: "plink_1U2SY2FnoS3uqGtraeZpf74O"
      })
    );

    const { validateMtdCheckoutSession } = await import("./mtd-delivery");

    await expect(validateMtdCheckoutSession({ pack: "starter", sessionId: "cs_live_incomplete" })).resolves.toEqual({
      ok: false,
      reason: "unpaid"
    });
  });

  it("rejects checkout sessions from the wrong payment link", async () => {
    retrieve.mockResolvedValue(
      checkoutSession({
        priceId: "price_1U2SXaFnoS3uqGtrB8VxL3n3",
        productId: "prod_V2XcEqFonhHpTf",
        paymentLinkId: "plink_wrong"
      })
    );

    const { validateMtdCheckoutSession } = await import("./mtd-delivery");

    await expect(validateMtdCheckoutSession({ pack: "starter", sessionId: "cs_live_wrong_link" })).resolves.toEqual({
      ok: false,
      reason: "wrong-pack"
    });
  });

  it("rejects checkout sessions with the wrong price", async () => {
    retrieve.mockResolvedValue(
      checkoutSession({
        priceId: "price_wrong",
        productId: "prod_V2XcEqFonhHpTf",
        paymentLinkId: "plink_1U2SY2FnoS3uqGtraeZpf74O"
      })
    );

    const { validateMtdCheckoutSession } = await import("./mtd-delivery");

    await expect(validateMtdCheckoutSession({ pack: "starter", sessionId: "cs_live_wrong_price" })).resolves.toEqual({
      ok: false,
      reason: "wrong-pack"
    });
  });

  it("rejects checkout sessions with the wrong product", async () => {
    retrieve.mockResolvedValue(
      checkoutSession({
        priceId: "price_1U2SXaFnoS3uqGtrB8VxL3n3",
        productId: "prod_wrong",
        paymentLinkId: "plink_1U2SY2FnoS3uqGtraeZpf74O"
      })
    );

    const { validateMtdCheckoutSession } = await import("./mtd-delivery");

    await expect(validateMtdCheckoutSession({ pack: "starter", sessionId: "cs_live_wrong_product" })).resolves.toEqual({
      ok: false,
      reason: "wrong-pack"
    });
  });

  it("rejects a Starter Pack session for the Setup Kit page", async () => {
    retrieve.mockResolvedValue(
      checkoutSession({
        priceId: "price_1U2SXaFnoS3uqGtrB8VxL3n3",
        productId: "prod_V2XcEqFonhHpTf",
        paymentLinkId: "plink_1U2SY2FnoS3uqGtraeZpf74O"
      })
    );

    const { validateMtdCheckoutSession } = await import("./mtd-delivery");

    await expect(validateMtdCheckoutSession({ pack: "setup", sessionId: "cs_live_wrong_pack" })).resolves.toEqual({
      ok: false,
      reason: "wrong-pack"
    });
  });

  it("rejects sessions Stripe cannot retrieve", async () => {
    retrieve.mockRejectedValue(new Error("No such checkout.session"));

    const { validateMtdCheckoutSession } = await import("./mtd-delivery");

    await expect(validateMtdCheckoutSession({ pack: "starter", sessionId: "cs_live_missing" })).resolves.toEqual({
      ok: false,
      reason: "invalid"
    });
  });
});
