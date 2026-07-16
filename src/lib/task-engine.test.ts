import { describe, expect, it } from "vitest";
import type { BusinessProfile } from "@prisma/client";
import { buildDeadlineTasks } from "./task-engine";
import { reminderIntervalFor } from "./reminders";

const baseProfile: BusinessProfile = {
  id: "profile-1",
  businessId: "business-1",
  businessType: "SOLE_TRADER",
  legalBusinessName: "Demo business",
  tradingName: null,
  companyNumber: null,
  companiesHouseConnectedAt: null,
  companiesHouseLastSyncedAt: null,
  companiesHouseSyncStatus: null,
  companiesHouseSyncError: null,
  companiesHouseCompanyStatus: null,
  companiesHouseCompanyType: null,
  companiesHouseRegisteredOffice: null,
  companiesHouseSicCodes: [],
  companiesHouseAccountsNextDue: null,
  companiesHouseConfirmationNextDue: null,
  companiesHouseAccountsOverdue: null,
  companiesHouseConfirmationOverdue: null,
  companiesHouseAccountingReferenceDay: null,
  companiesHouseAccountingReferenceMonth: null,
  companiesHouseSnapshot: null,
  worksAlone: "YES",
  startedTradingOn: new Date("2026-04-06T00:00:00.000Z"),
  companyRegisteredOn: null,
  accountingReferenceDate: null,
  firstAccountingPeriodEnd: null,
  paysSelfThroughCompany: "NO",
  registeredForVat: "NO",
  vatRegisteredOn: null,
  vatAccountingPeriod: "NOT_SURE",
  vatPeriodEndsOn: null,
  employsPeople: "NO",
  firstPayday: null,
  usesAccountant: "NO",
  businessYearEndMonth: 3,
  wantsEmailReminders: true,
  salesSoFarPence: 1000000,
  costsSoFarPence: 200000,
  onboardingCompletedAt: new Date("2026-07-13T00:00:00.000Z"),
  createdAt: new Date("2026-07-13T00:00:00.000Z"),
  updatedAt: new Date("2026-07-13T00:00:00.000Z")
};

describe("buildDeadlineTasks", () => {
  it("calculates sole trader Self Assessment dates from the trading start date", () => {
    const tasks = buildDeadlineTasks(baseProfile, new Date("2026-07-14T00:00:00.000Z"));

    expect(tasks.find((task) => task.key === "sole-trader-self-assessment-register")?.dueDate?.toISOString()).toContain("2027-10-05");
    expect(tasks.find((task) => task.key === "sole-trader-self-assessment-return")?.dueDate?.toISOString()).toContain("2028-01-31");
    expect(tasks.every((task) => task.ruleVersion === "stage-2-2026-07-14")).toBe(true);
  });

  it("calculates first limited-company deadlines separately", () => {
    const tasks = buildDeadlineTasks(
      {
        ...baseProfile,
        businessType: "LIMITED_COMPANY",
        companyRegisteredOn: new Date("2026-04-10T00:00:00.000Z"),
        firstAccountingPeriodEnd: new Date("2027-04-30T00:00:00.000Z")
      },
      new Date("2026-07-14T00:00:00.000Z")
    );

    expect(tasks.find((task) => task.key === "limited-company-first-accounts")?.dueDate?.toISOString()).toContain("2028-01-10");
    expect(tasks.find((task) => task.key === "limited-company-corporation-tax-payment")?.dueDate?.toISOString()).toContain("2028-01-31");
    expect(tasks.find((task) => task.key === "limited-company-tax-return")?.dueDate?.toISOString()).toContain("2028-04-30");
  });

  it("does not invent dates when required information is missing", () => {
    const tasks = buildDeadlineTasks(
      { ...baseProfile, businessType: "LIMITED_COMPANY", companyRegisteredOn: null, startedTradingOn: null },
      new Date("2026-07-14T00:00:00.000Z")
    );

    const missing = tasks.filter((task) => task.status === "NEEDS_INFORMATION");
    expect(missing.length).toBeGreaterThan(0);
    expect(missing.every((task) => task.dueDate === null)).toBe(true);
  });

  it("adds VAT and PAYE tasks only when relevant", () => {
    const tasks = buildDeadlineTasks(
      {
        ...baseProfile,
        registeredForVat: "YES",
        vatPeriodEndsOn: new Date("2026-09-30T00:00:00.000Z"),
        employsPeople: "YES",
        firstPayday: new Date("2026-08-01T00:00:00.000Z")
      },
      new Date("2026-07-14T00:00:00.000Z")
    );

    expect(tasks.find((task) => task.key === "vat-return")?.dueDate?.toISOString()).toContain("2026-11-06");
    expect(tasks.find((task) => task.key === "paye-register-employer")?.dueDate?.toISOString()).toContain("2026-08-01");
  });
});

describe("reminderIntervalFor", () => {
  it("selects configured reminder intervals", () => {
    const today = new Date("2026-07-14T00:00:00.000Z");
    expect(reminderIntervalFor(new Date("2026-08-13T00:00:00.000Z"), today)).toBe("THIRTY_DAYS");
    expect(reminderIntervalFor(new Date("2026-07-21T00:00:00.000Z"), today)).toBe("SEVEN_DAYS");
    expect(reminderIntervalFor(new Date("2026-07-07T00:00:00.000Z"), today)).toBe("OVERDUE");
  });
});
