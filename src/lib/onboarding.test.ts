import { describe, expect, it } from "vitest";
import { onboardingSchema } from "./onboarding";

describe("onboardingSchema", () => {
  it("accepts unsure answers where appropriate", () => {
    const result = onboardingSchema.safeParse({
      businessType: "NOT_SURE",
      legalBusinessName: "Demo business",
      registeredForVat: "NOT_SURE",
      employsPeople: "NOT_SURE",
      usesAccountant: "NOT_SURE",
      wantsEmailReminders: "YES",
      salesSoFar: 0,
      costsSoFar: 0,
      canUpdateLater: "YES"
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid months", () => {
    const result = onboardingSchema.safeParse({
      businessType: "SOLE_TRADER",
      legalBusinessName: "Demo business",
      registeredForVat: "NO",
      employsPeople: "NO",
      usesAccountant: "NO",
      wantsEmailReminders: "NO",
      businessYearEndMonth: 13,
      salesSoFar: 0,
      costsSoFar: 0,
      canUpdateLater: "YES"
    });

    expect(result.success).toBe(false);
  });
});
