import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitSupportEnquiry } from "@/lib/support-enquiries";

const mocks = vi.hoisted(() => ({
  sendEnquiryNotification: vi.fn(),
  logNotificationFailure: vi.fn()
}));

vi.mock("@/lib/notifications/send-enquiry-notification", () => ({
  sendEnquiryNotification: mocks.sendEnquiryNotification
}));

vi.mock("@/lib/notifications/email-client", () => ({
  logNotificationFailure: mocks.logNotificationFailure
}));

function validFormData() {
  const formData = new FormData();
  formData.set("name", "Ada Founder");
  formData.set("email", "ada@example.com");
  formData.set("telephone", "07123 456789");
  formData.set("companyName", "Ada Ltd");
  formData.set("category", "product");
  formData.set("message", "Can you help me understand Business Sorted setup?");
  formData.set("source", "/support");
  return formData;
}

describe("support enquiry action notifications", () => {
  beforeEach(() => {
    mocks.sendEnquiryNotification.mockReset();
    mocks.logNotificationFailure.mockReset();
    mocks.sendEnquiryNotification.mockResolvedValue(undefined);
  });

  it("sends one notification after a valid enquiry is accepted", async () => {
    const result = await submitSupportEnquiry(validFormData());

    expect(result).toEqual({ ok: true, message: "Thanks, your enquiry has been received." });
    expect(mocks.sendEnquiryNotification).toHaveBeenCalledOnce();
    expect(mocks.sendEnquiryNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        enquiryId: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
        ),
        name: "Ada Founder",
        email: "ada@example.com",
        telephone: "07123 456789",
        companyName: "Ada Ltd",
        category: "product",
        message: "Can you help me understand Business Sorted setup?",
        source: "/support",
        submittedAt: expect.any(Date)
      })
    );
  });

  it("does not notify for invalid enquiry submissions", async () => {
    const formData = new FormData();
    formData.set("name", "Ada");
    formData.set("email", "not-an-email");
    formData.set("category", "product");
    formData.set("message", "Hello");

    const result = await submitSupportEnquiry(formData);

    expect(result.ok).toBe(false);
    expect(mocks.sendEnquiryNotification).not.toHaveBeenCalled();
  });

  it("does not notify honeypot submissions", async () => {
    const formData = validFormData();
    formData.set("website", "https://spam.example");

    const result = await submitSupportEnquiry(formData);

    expect(result).toEqual({ ok: true, message: "Thanks, your enquiry has been received." });
    expect(mocks.sendEnquiryNotification).not.toHaveBeenCalled();
  });

  it("does not reverse accepted enquiries when the notification provider fails", async () => {
    mocks.sendEnquiryNotification.mockRejectedValue(new Error("resend unavailable"));

    const result = await submitSupportEnquiry(validFormData());

    expect(result).toEqual({ ok: true, message: "Thanks, your enquiry has been received." });
    expect(mocks.logNotificationFailure).toHaveBeenCalledWith({
      eventType: "enquiry",
      recordId: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      ),
      error: expect.any(Error)
    });
  });
});
