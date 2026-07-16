import { describe, expect, it } from "vitest";
import type { BusinessProfile, Task } from "@prisma/client";
import {
  detectMaterialChanges,
  isUnambiguousFilingForTask,
  normaliseCompanyProfile,
  profileConflicts
} from "./sync";

const profile: BusinessProfile = {
  id: "profile-1",
  businessId: "business-1",
  businessType: "LIMITED_COMPANY",
  legalBusinessName: "OLD NAME LIMITED",
  tradingName: null,
  companyNumber: "00001234",
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
  startedTradingOn: null,
  companyRegisteredOn: new Date("2026-01-01T00:00:00.000Z"),
  accountingReferenceDate: null,
  firstAccountingPeriodEnd: null,
  paysSelfThroughCompany: "NOT_SURE",
  registeredForVat: "NO",
  vatRegisteredOn: null,
  vatAccountingPeriod: "NOT_SURE",
  vatPeriodEndsOn: null,
  employsPeople: "NO",
  firstPayday: null,
  usesAccountant: "NO",
  businessYearEndMonth: null,
  wantsEmailReminders: true,
  salesSoFarPence: 0,
  costsSoFarPence: 0,
  onboardingCompletedAt: null,
  createdAt: new Date("2026-07-16T00:00:00.000Z"),
  updatedAt: new Date("2026-07-16T00:00:00.000Z")
};

describe("Companies House sync helpers", () => {
  it("normalises a Companies House company profile into a safe preview", () => {
    const preview = normaliseCompanyProfile({
      company_name: "DEMO LIMITED",
      company_number: "00001234",
      company_status: "active",
      type: "ltd",
      date_of_creation: "2026-01-15",
      sic_codes: ["62020"],
      registered_office_address: {
        address_line_1: "1 Example Street",
        locality: "London",
        postal_code: "SW1A 1AA"
      },
      accounts: {
        accounting_reference_date: { day: "31", month: "12" },
        next_due: "2027-10-15",
        overdue: false
      },
      confirmation_statement: {
        next_due: "2027-01-29",
        overdue: false
      }
    });

    expect(preview).toMatchObject({
      companyName: "DEMO LIMITED",
      companyNumber: "00001234",
      incorporatedOn: "2026-01-15",
      registeredOffice: "1 Example Street, London, SW1A 1AA",
      accountingReferenceDay: 31,
      accountingReferenceMonth: 12,
      accountsNextDue: "2027-10-15",
      confirmationNextDue: "2027-01-29"
    });
  });

  it("detects profile conflicts without overwriting customer-entered values", () => {
    const preview = normaliseCompanyProfile({
      company_name: "NEW NAME LIMITED",
      company_number: "00001234",
      date_of_creation: "2026-02-01"
    });

    expect(profileConflicts(profile, preview)).toEqual([
      { field: "legalBusinessName", current: "OLD NAME LIMITED", companiesHouse: "NEW NAME LIMITED" },
      { field: "companyRegisteredOn", current: "2026-01-01", companiesHouse: "2026-02-01" }
    ]);
  });

  it("detects material changes from the last confirmed snapshot", () => {
    const preview = normaliseCompanyProfile({
      company_name: "DEMO LIMITED",
      company_number: "00001234",
      company_status: "active",
      registered_office_address: { address_line_1: "New office" },
      sic_codes: ["70229"],
      accounts: { next_due: "2027-10-15", overdue: false },
      confirmation_statement: { next_due: "2027-01-29", overdue: false }
    });

    const changes = detectMaterialChanges(
      {
        companyStatus: "active",
        registeredOffice: "Old office",
        sicCodes: ["62020"],
        accountsNextDue: "2027-10-15",
        confirmationNextDue: "2027-01-29"
      },
      preview
    );

    expect(changes).toEqual(["registeredOffice", "sicCodes"]);
  });

  it("only treats filing evidence as unambiguous when it is close to the task due date", () => {
    const task = {
      dueDate: new Date("2026-07-14T12:00:00.000Z"),
      status: "DUE_SOON"
    } as Pick<Task, "dueDate" | "status">;

    expect(isUnambiguousFilingForTask(task, { category: "confirmation-statement", type: "CS01", date: "2026-07-15" })).toBeInstanceOf(Date);
    expect(isUnambiguousFilingForTask(task, { category: "confirmation-statement", type: "CS01", date: "2026-10-01" })).toBeNull();
    expect(isUnambiguousFilingForTask({ ...task, status: "COMPLETED" }, { date: "2026-07-15" })).toBeNull();
  });
});
