import { describe, expect, it } from "vitest";
import type { BusinessProfile } from "@prisma/client";
import { buildInitialTasks } from "./task-engine";

const baseProfile: BusinessProfile = {
  id: "profile-1",
  businessId: "business-1",
  businessType: "SOLE_TRADER",
  worksAlone: "YES",
  startedTradingOn: new Date("2026-04-06T00:00:00.000Z"),
  companyRegisteredOn: null,
  paysSelfThroughCompany: "NO",
  registeredForVat: "NOT_SURE",
  usesAccountant: "NO",
  businessYearEndMonth: 3,
  wantsEmailReminders: true,
  salesSoFarPence: 1000000,
  costsSoFarPence: 200000,
  onboardingCompletedAt: new Date("2026-07-13T00:00:00.000Z"),
  createdAt: new Date("2026-07-13T00:00:00.000Z"),
  updatedAt: new Date("2026-07-13T00:00:00.000Z")
};

describe("buildInitialTasks", () => {
  it("creates sole trader tasks in plain English", () => {
    const tasks = buildInitialTasks(baseProfile);

    expect(tasks.some((task) => task.title === "Prepare for Self Assessment")).toBe(true);
    expect(tasks.every((task) => task.adviceBoundary.includes("general information"))).toBe(true);
  });

  it("adds limited company tasks for company profiles", () => {
    const tasks = buildInitialTasks({
      ...baseProfile,
      businessType: "LIMITED_COMPANY",
      companyRegisteredOn: new Date("2026-04-10T00:00:00.000Z")
    });

    expect(tasks.some((task) => task.title === "Confirm your company details")).toBe(true);
    expect(tasks.some((task) => task.officialSourceUrl.includes("companies-house"))).toBe(true);
  });
});
