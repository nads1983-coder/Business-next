import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  createUser: vi.fn(),
  hashPassword: vi.fn(),
  createVerificationToken: vi.fn(),
  sendVerificationEmail: vi.fn(),
  sendSignupNotification: vi.fn(),
  logNotificationFailure: vi.fn(),
  redirect: vi.fn((href: string) => {
    throw new Error(`redirect:${href}`);
  })
}));

vi.mock("bcryptjs", () => ({
  hash: mocks.hashPassword
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    user: {
      findUnique: mocks.findUnique,
      create: mocks.createUser
    }
  })
}));

vi.mock("@/lib/auth-tokens", () => ({
  createVerificationToken: mocks.createVerificationToken
}));

vi.mock("@/lib/email", () => ({
  sendVerificationEmail: mocks.sendVerificationEmail
}));

vi.mock("@/lib/notifications/send-signup-notification", () => ({
  sendSignupNotification: mocks.sendSignupNotification
}));

vi.mock("@/lib/notifications/email-client", () => ({
  logNotificationFailure: mocks.logNotificationFailure
}));

function validFormData() {
  const formData = new FormData();
  formData.set("name", "Ada Founder");
  formData.set("email", "ADA@example.com");
  formData.set("password", "longpassword");
  return formData;
}

describe("register action notifications", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.findUnique.mockReset();
    mocks.createUser.mockReset();
    mocks.hashPassword.mockReset();
    mocks.createVerificationToken.mockReset();
    mocks.sendVerificationEmail.mockReset();
    mocks.sendSignupNotification.mockReset();
    mocks.logNotificationFailure.mockReset();
    mocks.redirect.mockClear();

    mocks.findUnique.mockResolvedValue(null);
    mocks.hashPassword.mockResolvedValue("hashed-password");
    mocks.createUser.mockResolvedValue({
      id: "user-123",
      name: "Ada Founder",
      email: "ada@example.com",
      createdAt: new Date("2026-08-01T10:30:00Z")
    });
    mocks.createVerificationToken.mockResolvedValue("verify-token");
    mocks.sendVerificationEmail.mockResolvedValue(undefined);
    mocks.sendSignupNotification.mockResolvedValue(undefined);
  });

  it("sends one sign-up notification after a successful persisted registration", async () => {
    const { registerAction } = await import("@/app/(auth)/register/actions");

    await expect(registerAction(null, validFormData())).rejects.toThrow("redirect:/check-email?type=verify");

    expect(mocks.createUser).toHaveBeenCalledOnce();
    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith({ email: "ada@example.com", token: "verify-token" });
    expect(mocks.sendSignupNotification).toHaveBeenCalledOnce();
    expect(mocks.sendSignupNotification).toHaveBeenCalledWith({
      userId: "user-123",
      name: "Ada Founder",
      email: "ada@example.com",
      source: "/register",
      submittedAt: new Date("2026-08-01T10:30:00Z")
    });
  });

  it("does not notify for invalid registration submissions", async () => {
    const { registerAction } = await import("@/app/(auth)/register/actions");
    const formData = new FormData();
    formData.set("name", "A");
    formData.set("email", "not-an-email");
    formData.set("password", "short");

    const result = await registerAction(null, formData);

    expect(result.ok).toBe(false);
    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.sendSignupNotification).not.toHaveBeenCalled();
  });

  it("does not notify when the core account creation fails", async () => {
    mocks.createUser.mockRejectedValue(new Error("database unavailable"));
    const { registerAction } = await import("@/app/(auth)/register/actions");

    await expect(registerAction(null, validFormData())).rejects.toThrow("database unavailable");

    expect(mocks.sendSignupNotification).not.toHaveBeenCalled();
  });

  it("does not reverse successful registration when the notification provider fails", async () => {
    mocks.sendSignupNotification.mockRejectedValue(new Error("resend unavailable"));
    const { registerAction } = await import("@/app/(auth)/register/actions");

    await expect(registerAction(null, validFormData())).rejects.toThrow("redirect:/check-email?type=verify");

    expect(mocks.logNotificationFailure).toHaveBeenCalledWith({
      eventType: "signup",
      recordId: "user-123",
      error: expect.any(Error)
    });
    expect(mocks.redirect).toHaveBeenCalledWith("/check-email?type=verify");
  });
});
