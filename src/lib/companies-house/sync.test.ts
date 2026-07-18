import { describe, expect, it } from "vitest";
import type { BusinessProfile, Task } from "@prisma/client";
import {
  buildCompaniesHouseChangeRecords,
  companiesHouseSnapshotUpdate,
  companiesHouseEligibleProfileWhere,
  companiesHouseSyncConfig,
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
  reminderPreference: "standard",
  reminderSnoozedUntil: null,
  reminderPreferredHour: 9,
  reminderTimezone: "Europe/London",
  salesSoFarPence: 0,
  costsSoFarPence: 0,
  onboardingCompletedAt: null,
  createdAt: new Date("2026-07-16T00:00:00.000Z"),
  updatedAt: new Date("2026-07-16T00:00:00.000Z")
};

describe("Companies House sync helpers", () => {
  it("uses configurable scheduled sync limits with safe defaults and caps", () => {
    expect(companiesHouseSyncConfig({} as NodeJS.ProcessEnv)).toEqual({
      intervalHours: 24,
      batchSize: 25,
      providerDelayMs: 250,
      maxBatchSize: 50
    });

    expect(
      companiesHouseSyncConfig({
        COMPANIES_HOUSE_SYNC_INTERVAL_HOURS: "12",
        COMPANIES_HOUSE_SYNC_BATCH_SIZE: "500",
        COMPANIES_HOUSE_SYNC_DELAY_MS: "1"
      } as unknown as NodeJS.ProcessEnv)
    ).toEqual({
      intervalHours: 12,
      batchSize: 50,
      providerDelayMs: 1,
      maxBatchSize: 50
    });
  });

  it("builds scheduled sync eligibility around active product access and stale Companies House checks", () => {
    const now = new Date("2026-07-18T10:00:00.000Z");

    expect(companiesHouseEligibleProfileWhere(now, 24)).toMatchObject({
      businessType: "LIMITED_COMPANY",
      companyNumber: { not: null },
      AND: [
        { OR: [{ companiesHouseSyncStatus: null }, { companiesHouseSyncStatus: { not: "disabled" } }] },
        {
          OR: [
            { companiesHouseLastSyncedAt: null },
            { companiesHouseLastSyncedAt: { lt: new Date("2026-07-17T10:00:00.000Z") } }
          ]
        }
      ],
      business: {
        user: {
          OR: expect.arrayContaining([
            { role: "ADMIN" },
            expect.objectContaining({ entitlements: expect.any(Object) }),
            expect.objectContaining({ subscriptions: expect.any(Object) })
          ])
        }
      }
    });
  });

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

  it("builds a timestamped Companies House persistence patch from a verified preview", () => {
    const preview = normaliseCompanyProfile({
      company_name: "DEMO LIMITED",
      company_number: "00001234",
      company_status: "active",
      type: "ltd",
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
    const syncedAt = new Date("2026-07-18T10:00:00.000Z");

    expect(companiesHouseSnapshotUpdate(preview, syncedAt)).toMatchObject({
      companiesHouseConnectedAt: syncedAt,
      companiesHouseLastSyncedAt: syncedAt,
      companiesHouseSyncStatus: "connected",
      companiesHouseSyncError: null,
      companiesHouseCompanyStatus: "active",
      companiesHouseCompanyType: "ltd",
      companiesHouseAccountingReferenceDay: 31,
      companiesHouseAccountingReferenceMonth: 12,
      companiesHouseAccountsNextDue: new Date("2027-10-15T12:00:00.000Z"),
      companiesHouseConfirmationNextDue: new Date("2027-01-29T12:00:00.000Z"),
      companiesHouseSnapshot: expect.objectContaining({
        companyName: "DEMO LIMITED",
        companyNumber: "00001234"
      })
    });
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

  it("builds dedupe-ready change records with deadline impact flags", () => {
    const checkedAt = new Date("2026-07-18T10:00:00.000Z");
    const preview = normaliseCompanyProfile({
      company_name: "NEW NAME LIMITED",
      company_number: "00001234",
      company_status: "active",
      registered_office_address: { address_line_1: "New office" },
      sic_codes: ["70229"],
      accounts: { next_due: "2027-11-15", overdue: false },
      confirmation_statement: { next_due: "2027-01-29", overdue: false }
    });

    const changes = buildCompaniesHouseChangeRecords({
      businessId: "business-1",
      companyNumber: "1234",
      previous: {
        companyName: "OLD NAME LIMITED",
        companyStatus: "active",
        registeredOffice: "Old office",
        sicCodes: ["62020"],
        accountsNextDue: "2027-10-15",
        confirmationNextDue: "2027-01-29"
      },
      next: preview,
      checkedAt
    });

    expect(changes).toEqual([
      expect.objectContaining({
        businessId: "business-1",
        companyNumber: "1234",
        field: "companyName",
        previousValue: "OLD NAME LIMITED",
        newValue: "NEW NAME LIMITED",
        detectedAt: checkedAt,
        sourceCheckedAt: checkedAt,
        affectsDeadlines: false,
        previousValueHash: expect.any(String),
        newValueHash: expect.any(String)
      }),
      expect.objectContaining({
        field: "registeredOffice",
        affectsDeadlines: false
      }),
      expect.objectContaining({
        field: "sicCodes",
        previousValue: ["62020"],
        newValue: ["70229"],
        affectsDeadlines: false
      }),
      expect.objectContaining({
        field: "accountsNextDue",
        previousValue: "2027-10-15",
        newValue: "2027-11-15",
        affectsDeadlines: true
      })
    ]);
  });

  it("only treats filing evidence as unambiguous when it is close to the task due date", () => {
    const task = {
      createdAt: new Date("2026-07-01T12:00:00.000Z"),
      dueDate: new Date("2026-07-14T12:00:00.000Z"),
      status: "DUE_SOON",
      history: []
    } as Pick<Task, "createdAt" | "dueDate" | "status"> & { history: [] };

    expect(isUnambiguousFilingForTask(task, { category: "confirmation-statement", type: "CS01", date: "2026-07-15" })).toBeInstanceOf(Date);
    expect(isUnambiguousFilingForTask(task, { category: "confirmation-statement", type: "CS01", date: "2026-10-01" })).toBeNull();
    expect(isUnambiguousFilingForTask(task, { category: "confirmation-statement", type: "CS01", date: "2026-06-30" })).toBeNull();
    expect(isUnambiguousFilingForTask({ ...task, status: "COMPLETED" }, { date: "2026-07-15" })).toBeNull();
  });

  it("suppresses repeated Companies House auto-completion after the same evidence is restored", () => {
    const task = {
      createdAt: new Date("2026-07-01T12:00:00.000Z"),
      dueDate: new Date("2026-07-14T12:00:00.000Z"),
      status: "COMING_UP",
      history: [
        {
          action: "COMPLETED",
          metadata: {
            source: "companies_house",
            evidenceKey: "00001234:confirmation-statement:CS01:2026-07-15:confirmation-statement"
          }
        },
        { action: "RESTORED", metadata: null }
      ]
    } as Pick<Task, "createdAt" | "dueDate" | "status"> & {
      history: Array<{ action: string; metadata: { source: string; evidenceKey: string } | null }>;
    };

    expect(
      isUnambiguousFilingForTask(
        task,
        {
          category: "confirmation-statement",
          type: "CS01",
          date: "2026-07-15",
          description: "confirmation-statement"
        },
        "00001234"
      )
    ).toBeNull();
  });
});
