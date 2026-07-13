import { describe, expect, it } from "vitest";
import { passwordResetEmailHtml, verificationEmailHtml } from "./email-html";

describe("email html copy", () => {
  it("uses plain-English verification copy", () => {
    const html = verificationEmailHtml("https://example.com/verify-email?token=test");

    expect(html).toContain("Confirm your email address");
    expect(html).toContain("This link works for 1 hour.");
  });

  it("uses plain-English password reset copy", () => {
    const html = passwordResetEmailHtml("https://example.com/reset-password?token=test");

    expect(html).toContain("Reset your password");
    expect(html).toContain("can only be used once");
  });
});
