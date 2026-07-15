import { beforeEach, describe, expect, it, vi } from "vitest";

function resetUrlEnv() {
  delete process.env.BUSINESS_NEXT_STRIPE_MODE;
  delete process.env.BUSINESS_NEXT_APPROVED_APP_URL;
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.NEXTAUTH_URL;
}

describe("email and app URL configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    resetUrlEnv();
  });

  it("uses the approved production URL when live mode is configured for businesssorted.uk", async () => {
    process.env.BUSINESS_NEXT_STRIPE_MODE = "live";
    process.env.BUSINESS_NEXT_APPROVED_APP_URL = "https://businesssorted.uk";
    process.env.NEXT_PUBLIC_APP_URL = "https://businesssorted.uk";
    process.env.NEXTAUTH_URL = "https://businesssorted.uk";

    const { emailConfig } = await import("./email");

    expect(emailConfig.appUrl).toBe("https://businesssorted.uk");
  });

  it("falls back to the deployment URL when the live production URL is not approved", async () => {
    process.env.BUSINESS_NEXT_STRIPE_MODE = "live";
    process.env.NEXT_PUBLIC_APP_URL = "https://files-mentioned-by-the-user-build-umber.vercel.app";

    const { emailConfig } = await import("./email");

    expect(emailConfig.appUrl).toBe("https://files-mentioned-by-the-user-build-umber.vercel.app");
  });
});
