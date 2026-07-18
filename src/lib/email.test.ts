import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: sendMock
    };
  }
}));

describe("transactional email sender", () => {
  beforeEach(() => {
    vi.resetModules();
    sendMock.mockReset();
    sendMock.mockResolvedValue({ error: null });
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.EMAIL_FROM = "BusinessSorted <support@businesssorted.uk>";
    process.env.EMAIL_REPLY_TO = "support@businesssorted.uk";
    process.env.NEXT_PUBLIC_APP_URL = "https://businesssorted.uk";
  });

  it("sends verification emails from BusinessSorted with the support reply-to address", async () => {
    const { sendVerificationEmail } = await import("./email");

    await sendVerificationEmail({ email: "owner@example.com", token: "verify-token" });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "BusinessSorted <support@businesssorted.uk>",
        replyTo: "support@businesssorted.uk",
        to: "owner@example.com",
        subject: "Confirm your Business Sorted email address"
      }),
      expect.objectContaining({
        headers: {
          "Idempotency-Key": "verify-verify-token"
        }
      })
    );
  });

  it("sends reminder emails from the same sender configuration", async () => {
    const { sendDeadlineReminderEmail } = await import("./email");

    await sendDeadlineReminderEmail({
      email: "owner@example.com",
      taskTitle: "File confirmation statement",
      businessName: "Example Ltd",
      dueDate: "31 August 2026",
      timeRemaining: "in 30 days",
      nextAction: "Check Companies House",
      reason: "this task is due soon",
      preparationSteps: ["Open Companies House"],
      taskId: "task-1",
      idempotencyKey: "deadline-task-1"
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "BusinessSorted <support@businesssorted.uk>",
        replyTo: "support@businesssorted.uk",
        to: "owner@example.com",
        subject: "Business Sorted reminder: File confirmation statement"
      }),
      expect.objectContaining({
        headers: {
          "Idempotency-Key": "deadline-task-1"
        }
      })
    );
  });
});
