import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  send: vi.fn()
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: mocks.send
    };
  }
}));

function setEmailEnv() {
  process.env.RESEND_API_KEY = "test-resend-key";
  process.env.EMAIL_FROM = "Business Sorted <notifications@businesssorted.uk>";
  process.env.EMAIL_REPLY_TO = "support@businesssorted.uk";
  process.env.NOTIFICATION_EMAIL = "owner@example.com";
  process.env.NEXT_PUBLIC_APP_URL = "https://businesssorted.uk";
}

describe("operational notifications", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.send.mockReset();
    mocks.send.mockResolvedValue({ error: null });
    setEmailEnv();
  });

  it("sends sign-up notifications with a deterministic idempotency key", async () => {
    const { sendSignupNotification } = await import("./send-signup-notification");

    await sendSignupNotification({
      userId: "user-123",
      name: "Ada Founder",
      email: "ada@example.com",
      companyName: "Ada Ltd",
      source: "/register",
      submittedAt: new Date("2026-08-01T10:30:00Z")
    });

    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Business Sorted <notifications@businesssorted.uk>",
        to: "owner@example.com",
        replyTo: "support@businesssorted.uk",
        subject: "New Business Sorted Sign-Up",
        text: expect.stringContaining("Account/user ID: user-123")
      }),
      {
        headers: {
          "Idempotency-Key": "signup-user-123"
        }
      }
    );
  });

  it("sends enquiry notifications with customer reply-to and escaped HTML", async () => {
    const { sendEnquiryNotification } = await import("./send-enquiry-notification");

    await sendEnquiryNotification({
      enquiryId: "enquiry-123",
      name: "<script>Ada</script>",
      email: "ada@example.com",
      telephone: "07123 456789",
      companyName: "Ada & Co",
      category: "product",
      message: "<b>Hello</b> & can you help?",
      source: "/support",
      submittedAt: new Date("2026-08-01T10:45:00Z")
    });

    const payload = mocks.send.mock.calls[0][0];
    expect(payload.replyTo).toBe("ada@example.com");
    expect(payload.subject).toBe("New Business Sorted Enquiry");
    expect(payload.html).toContain("&lt;b&gt;Hello&lt;/b&gt; &amp; can you help?");
    expect(payload.html).not.toContain("<b>Hello</b>");
    expect(payload.text).toContain("Message:");
    expect(mocks.send.mock.calls[0][1]).toEqual({
      headers: {
        "Idempotency-Key": "enquiry-enquiry-123"
      }
    });
  });

  it("requires the notification recipient to be configured server-side", async () => {
    delete process.env.NOTIFICATION_EMAIL;
    const { sendSignupNotification } = await import("./send-signup-notification");

    await expect(
      sendSignupNotification({
        userId: "user-123",
        name: "Ada Founder",
        email: "ada@example.com",
        source: "/register",
        submittedAt: new Date("2026-08-01T10:30:00Z")
      })
    ).rejects.toThrow("NOTIFICATION_EMAIL");
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
