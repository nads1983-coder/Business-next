import { describe, expect, it } from "vitest";
import { onboardingSchema } from "./onboarding";

describe("onboardingSchema", () => {
  it("accepts unsure answers where appropriate", () => {
    const result = onboardingSchema.safeParse({
      businessType: "NOT_SURE",
      worksAlone: "NOT_SURE",
      paysSelfThroughCompany: "NOT_SURE",
      registeredForVat: "NOT_SURE",
      usesAccountant: "NOT_SURE",
      wantsEmailReminders: "YES",
      salesSoFar: 0,
      costsSoFar: 0
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid months", () => {
    const result = onboardingSchema.safeParse({
      businessType: "SOLE_TRADER",
      worksAlone: "YES",
      paysSelfThroughCompany: "NO",
      registeredForVat: "NO",
      usesAccountant: "NO",
      wantsEmailReminders: "NO",
      businessYearEndMonth: 13,
      salesSoFar: 0,
      costsSoFar: 0
    });

    expect(result.success).toBe(false);
  });
});
