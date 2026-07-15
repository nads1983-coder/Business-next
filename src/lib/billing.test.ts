import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const findUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    user: { findUnique }
  })
}));

describe("billing entitlement access", () => {
  beforeEach(() => {
    vi.resetModules();
    findUnique.mockReset();
    process.env.BUSINESS_NEXT_BILLING_ENABLED = "false";
    delete process.env.STRIPE_PRICE_ID_MONTHLY;
    delete process.env.STRIPE_LIVE_PRICE_ID_MONTHLY;
  });

  it("allows explicit founder access without pretending it is paid", async () => {
    findUnique.mockResolvedValue({
      role: "USER",
      entitlements: [{ kind: "FOUNDER" }],
      subscriptions: []
    });

    const { getProductAccess } = await import("./billing");
    const access = await getProductAccess("user_1");

    expect(access.allowed).toBe(true);
    expect(access.source).toBe("FOUNDER");
  });

  it("allows active paid subscription state", async () => {
    findUnique.mockResolvedValue({
      role: "USER",
      entitlements: [],
      subscriptions: [{ billingStatus: "ACTIVE" }]
    });

    const { getProductAccess } = await import("./billing");
    const access = await getProductAccess("user_1");

    expect(access.allowed).toBe(true);
    expect(access.source).toBe("PAID");
  });

  it("blocks ordinary users when billing is not live and no founder access exists", async () => {
    findUnique.mockResolvedValue({
      role: "USER",
      entitlements: [],
      subscriptions: []
    });

    const { getProductAccess } = await import("./billing");
    const access = await getProductAccess("user_1");

    expect(access.allowed).toBe(false);
    expect(access.source).toBe("BILLING_NOT_LIVE");
  });
});
