import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

const runCompaniesHouseSync = vi.fn(async () => ({ processed: 1, skipped: 0, failed: 0 }));

vi.mock("@/lib/companies-house/sync", () => ({
  companiesHouseSyncConfig: () => ({ batchSize: 25, intervalHours: 24, providerDelayMs: 250, maxBatchSize: 50 }),
  runCompaniesHouseSync
}));

const originalSecret = process.env.CRON_SECRET;

afterEach(() => {
  process.env.CRON_SECRET = originalSecret;
  runCompaniesHouseSync.mockClear();
});

describe("Companies House sync cron route", () => {
  it("rejects unauthenticated cron requests", async () => {
    process.env.CRON_SECRET = "secret";
    const { POST } = await import("./route");

    const response = await POST(new NextRequest("https://example.com/api/cron/companies-house-sync", { method: "POST" }));

    expect(response.status).toBe(401);
    expect(runCompaniesHouseSync).not.toHaveBeenCalled();
  });

  it("runs a bounded sync batch for authenticated cron requests", async () => {
    process.env.CRON_SECRET = "secret";
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("https://example.com/api/cron/companies-house-sync?limit=500", {
        method: "POST",
        headers: { authorization: "Bearer secret" }
      })
    );

    await expect(response.json()).resolves.toEqual({ processed: 1, skipped: 0, failed: 0 });
    expect(runCompaniesHouseSync).toHaveBeenCalledWith({ limit: 50 });
  });

  it("supports authenticated Vercel Cron GET requests", async () => {
    process.env.CRON_SECRET = "secret";
    const { GET } = await import("./route");

    const response = await GET(
      new NextRequest("https://example.com/api/cron/companies-house-sync", {
        method: "GET",
        headers: { authorization: "Bearer secret" }
      })
    );

    await expect(response.json()).resolves.toEqual({ processed: 1, skipped: 0, failed: 0 });
    expect(runCompaniesHouseSync).toHaveBeenCalledWith({ limit: 25 });
  });
});
