import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

const runDeadlineReminders = vi.fn(async () => ({
  eligible: 1,
  sent: 1,
  skipped: 0,
  failed: 0,
  dryRun: false,
  testMode: false,
  ruleVersion: "deadline-reminders-2026-07-18"
}));

vi.mock("@/lib/reminders", () => ({
  runDeadlineReminders
}));

const originalSecret = process.env.CRON_SECRET;

afterEach(() => {
  process.env.CRON_SECRET = originalSecret;
  runDeadlineReminders.mockClear();
});

describe("deadline reminders cron route", () => {
  it("rejects unauthenticated cron requests", async () => {
    process.env.CRON_SECRET = "secret";
    const { POST } = await import("./route");

    const response = await POST(new NextRequest("https://example.com/api/cron/deadline-reminders", { method: "POST" }));

    expect(response.status).toBe(401);
    expect(runDeadlineReminders).not.toHaveBeenCalled();
  });

  it("runs authenticated POST requests with dry-run support", async () => {
    process.env.CRON_SECRET = "secret";
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("https://example.com/api/cron/deadline-reminders?dryRun=1", {
        method: "POST",
        headers: { authorization: "Bearer secret" }
      })
    );

    await expect(response.json()).resolves.toMatchObject({ eligible: 1, sent: 1 });
    expect(runDeadlineReminders).toHaveBeenCalledWith({ dryRun: true });
  });

  it("supports authenticated Vercel Cron GET requests", async () => {
    process.env.CRON_SECRET = "secret";
    const { GET } = await import("./route");

    const response = await GET(
      new NextRequest("https://example.com/api/cron/deadline-reminders", {
        method: "GET",
        headers: { authorization: "Bearer secret" }
      })
    );

    await expect(response.json()).resolves.toMatchObject({ eligible: 1, sent: 1 });
    expect(runDeadlineReminders).toHaveBeenCalledWith({ dryRun: false });
  });
});
