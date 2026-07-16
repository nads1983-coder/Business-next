import "server-only";

import type { BusinessProfile, Prisma, Task } from "@prisma/client";
import { addDays, format } from "date-fns";
import {
  CompaniesHouseError,
  lookupCompanyFilingHistory,
  lookupCompanyProfile,
  normaliseCompanyNumber,
  type CompaniesHouseCompanyProfile,
  type CompaniesHouseFilingItem
} from "@/lib/companies-house/client";
import { getPrisma } from "@/lib/prisma";
import { parseUkDate, syncBusinessTasks } from "@/lib/task-engine";

export type CompaniesHousePreview = {
  companyName: string;
  companyNumber: string;
  companyStatus: string | null;
  companyType: string | null;
  incorporatedOn: string | null;
  registeredOffice: string | null;
  sicCodes: string[];
  accountingReferenceDay: number | null;
  accountingReferenceMonth: number | null;
  accountsNextDue: string | null;
  confirmationNextDue: string | null;
  accountsOverdue: boolean | null;
  confirmationOverdue: boolean | null;
  snapshot: Prisma.InputJsonValue;
};

type ProfilePatchDecision = {
  useCompaniesHouseValues?: boolean;
};

const companyTaskKeys = new Set([
  "limited-company-first-accounts",
  "limited-company-confirmation-statement"
]);

function toIsoDate(value?: string | null) {
  const parsed = parseUkDate(value);
  return parsed ? format(parsed, "yyyy-MM-dd") : null;
}

function toDate(value?: string | null) {
  return parseUkDate(value);
}

function toNumber(value?: string) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function registeredOfficeText(profile: CompaniesHouseCompanyProfile) {
  const address = profile.registered_office_address;
  if (!address) return null;
  const parts = [
    address.address_line_1,
    address.address_line_2,
    address.locality,
    address.region,
    address.postal_code,
    address.country
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function normaliseCompanyProfile(profile: CompaniesHouseCompanyProfile): CompaniesHousePreview {
  const accountingReferenceDay = toNumber(profile.accounts?.accounting_reference_date?.day);
  const accountingReferenceMonth = toNumber(profile.accounts?.accounting_reference_date?.month);
  const preview = {
    companyName: profile.company_name,
    companyNumber: normaliseCompanyNumber(profile.company_number),
    companyStatus: profile.company_status ?? null,
    companyType: profile.type ?? null,
    incorporatedOn: toIsoDate(profile.date_of_creation),
    registeredOffice: registeredOfficeText(profile),
    sicCodes: profile.sic_codes ?? [],
    accountingReferenceDay,
    accountingReferenceMonth,
    accountsNextDue: toIsoDate(profile.accounts?.next_due),
    confirmationNextDue: toIsoDate(profile.confirmation_statement?.next_due),
    accountsOverdue: profile.accounts?.overdue ?? null,
    confirmationOverdue: profile.confirmation_statement?.overdue ?? null
  };

  return {
    ...preview,
    snapshot: {
      companyName: preview.companyName,
      companyNumber: preview.companyNumber,
      companyStatus: preview.companyStatus,
      companyType: preview.companyType,
      registeredOffice: preview.registeredOffice,
      sicCodes: preview.sicCodes,
      accountingReferenceDay: preview.accountingReferenceDay,
      accountingReferenceMonth: preview.accountingReferenceMonth,
      accountsNextDue: preview.accountsNextDue,
      confirmationNextDue: preview.confirmationNextDue,
      accountsOverdue: preview.accountsOverdue,
      confirmationOverdue: preview.confirmationOverdue
    }
  };
}

export function profileConflicts(profile: BusinessProfile, preview: CompaniesHousePreview) {
  const conflicts: Array<{ field: string; current: string; companiesHouse: string }> = [];
  const currentCompanyName = profile.legalBusinessName?.trim();
  if (currentCompanyName && currentCompanyName !== preview.companyName) {
    conflicts.push({ field: "legalBusinessName", current: currentCompanyName, companiesHouse: preview.companyName });
  }
  const currentNumber = profile.companyNumber ? normaliseCompanyNumber(profile.companyNumber) : null;
  if (currentNumber && currentNumber !== preview.companyNumber) {
    conflicts.push({ field: "companyNumber", current: currentNumber, companiesHouse: preview.companyNumber });
  }
  const currentIncorporated = toIsoDate(profile.companyRegisteredOn?.toISOString().slice(0, 10));
  if (currentIncorporated && preview.incorporatedOn && currentIncorporated !== preview.incorporatedOn) {
    conflicts.push({ field: "companyRegisteredOn", current: currentIncorporated, companiesHouse: preview.incorporatedOn });
  }
  return conflicts;
}

function profileUpdateFromPreview(
  profile: BusinessProfile,
  preview: CompaniesHousePreview,
  decision: ProfilePatchDecision
) {
  const conflicts = profileConflicts(profile, preview);
  const allowOverwrite = decision.useCompaniesHouseValues;
  const update: Prisma.BusinessProfileUpdateInput = {
    businessType: "LIMITED_COMPANY",
    companyNumber: !profile.companyNumber || allowOverwrite ? preview.companyNumber : profile.companyNumber,
    legalBusinessName: !profile.legalBusinessName || allowOverwrite ? preview.companyName : profile.legalBusinessName,
    companyRegisteredOn:
      (!profile.companyRegisteredOn || allowOverwrite) && preview.incorporatedOn
        ? toDate(preview.incorporatedOn)
        : profile.companyRegisteredOn,
    businessYearEndMonth:
      (!profile.businessYearEndMonth || allowOverwrite) && preview.accountingReferenceMonth
        ? preview.accountingReferenceMonth
        : profile.businessYearEndMonth,
    companiesHouseConnectedAt: profile.companiesHouseConnectedAt ?? new Date(),
    companiesHouseLastSyncedAt: new Date(),
    companiesHouseSyncStatus: "connected",
    companiesHouseSyncError: null,
    companiesHouseCompanyStatus: preview.companyStatus,
    companiesHouseCompanyType: preview.companyType,
    companiesHouseRegisteredOffice: preview.registeredOffice,
    companiesHouseSicCodes: preview.sicCodes,
    companiesHouseAccountsNextDue: toDate(preview.accountsNextDue),
    companiesHouseConfirmationNextDue: toDate(preview.confirmationNextDue),
    companiesHouseAccountsOverdue: preview.accountsOverdue,
    companiesHouseConfirmationOverdue: preview.confirmationOverdue,
    companiesHouseAccountingReferenceDay: preview.accountingReferenceDay,
    companiesHouseAccountingReferenceMonth: preview.accountingReferenceMonth,
    companiesHouseSnapshot: preview.snapshot
  };

  return { update, conflicts };
}

export function detectMaterialChanges(
  previous: Prisma.JsonValue | null | undefined,
  next: CompaniesHousePreview
) {
  if (!previous || typeof previous !== "object" || Array.isArray(previous)) return [];
  const prior = previous as Record<string, unknown>;
  const watched: Array<keyof CompaniesHousePreview> = [
    "companyStatus",
    "registeredOffice",
    "sicCodes",
    "accountingReferenceDay",
    "accountingReferenceMonth",
    "accountsNextDue",
    "confirmationNextDue",
    "accountsOverdue",
    "confirmationOverdue"
  ];

  return watched.filter((field) => (
    Object.prototype.hasOwnProperty.call(prior, field) &&
    JSON.stringify(prior[field]) !== JSON.stringify(next[field])
  ));
}

function relevantFiling(items: CompaniesHouseFilingItem[], kind: "accounts" | "confirmation") {
  const acceptedTypes =
    kind === "accounts"
      ? new Set(["AA", "AA01", "DCA"])
      : new Set(["CS01", "AR01"]);
  return items.find((item) => {
    const categoryMatch =
      kind === "accounts"
        ? item.category === "accounts"
        : item.category === "confirmation-statement" || item.category === "annual-return";
    return categoryMatch && !!item.date && (!item.type || acceptedTypes.has(item.type));
  });
}

export function isUnambiguousFilingForTask(task: Pick<Task, "dueDate" | "status">, filing: CompaniesHouseFilingItem) {
  if (!task.dueDate || task.status === "COMPLETED" || task.status === "NOT_APPLICABLE" || !filing.date) {
    return null;
  }

  const filedOn = toDate(filing.date);
  if (!filedOn) return null;

  const latestReasonableFilingDate = addDays(task.dueDate, 45);
  if (filedOn > latestReasonableFilingDate) return null;

  return filedOn;
}

async function autoCompleteTask(task: Task, filing: CompaniesHouseFilingItem, userId: string | null | undefined) {
  const filedOn = isUnambiguousFilingForTask(task, filing);
  if (!filedOn) return false;

  const note = `Companies House shows that this filing was recorded on ${format(filedOn, "d MMMM yyyy")}, so this task was marked complete automatically.`;
  const prisma = getPrisma();
  await prisma.task.update({
    where: { id: task.id },
    data: {
      status: "COMPLETED",
      completedAt: filedOn,
      completedNote: note,
      history: {
        create: {
          userId,
          action: "COMPLETED",
          note,
          metadata: {
            source: "companies_house",
            filingType: filing.type ?? null,
            filingCategory: filing.category ?? null,
            automated: true
          }
        }
      }
    }
  });
  return true;
}

async function autoCompleteEligibleTasks(businessId: string, companyNumber: string, userId?: string | null) {
  let filingHistory;
  try {
    filingHistory = await lookupCompanyFilingHistory(companyNumber);
  } catch {
    return 0;
  }
  const items = filingHistory.items ?? [];
  const prisma = getPrisma();
  const tasks = await prisma.task.findMany({
    where: { businessId, key: { in: Array.from(companyTaskKeys) } }
  });

  let completed = 0;
  const accounts = relevantFiling(items, "accounts");
  const confirmation = relevantFiling(items, "confirmation");

  for (const task of tasks) {
    if (task.key === "limited-company-first-accounts" && accounts) {
      if (await autoCompleteTask(task, accounts, userId)) completed += 1;
    }
    if (task.key === "limited-company-confirmation-statement" && confirmation) {
      if (await autoCompleteTask(task, confirmation, userId)) completed += 1;
    }
  }

  return completed;
}

export async function previewCompany(companyNumber: string) {
  return normaliseCompanyProfile(await lookupCompanyProfile(companyNumber));
}

export async function connectCompaniesHouseProfile({
  businessId,
  userId,
  companyNumber,
  useCompaniesHouseValues = false
}: {
  businessId: string;
  userId: string;
  companyNumber: string;
  useCompaniesHouseValues?: boolean;
}) {
  const prisma = getPrisma();
  const business = await prisma.business.findFirst({
    where: { id: businessId, userId },
    include: { profile: true }
  });
  if (!business?.profile) throw new Error("Business profile not found.");

  const preview = await previewCompany(companyNumber);
  const { update, conflicts } = profileUpdateFromPreview(business.profile, preview, { useCompaniesHouseValues });
  const updated = await prisma.business.update({
    where: { id: business.id },
    data: {
      name: useCompaniesHouseValues || !business.name ? preview.companyName : business.name,
      type: "LIMITED_COMPANY",
      profile: { update }
    },
    include: { profile: true }
  });

  const taskSync = await syncBusinessTasks(business.id, userId);
  const completed = await autoCompleteEligibleTasks(business.id, preview.companyNumber, userId);

  await prisma.auditLog.create({
    data: {
      userId,
      action: "companies_house_connected",
      metadata: {
        businessId: business.id,
        companyNumber: preview.companyNumber,
        conflicts,
        taskSync,
        autoCompletedTasks: completed
      }
    }
  });

  return { profile: updated.profile, preview, conflicts, taskSync, autoCompletedTasks: completed };
}

export async function syncCompaniesHouseForBusiness({
  businessId,
  userId,
  force = false
}: {
  businessId: string;
  userId?: string | null;
  force?: boolean;
}) {
  const prisma = getPrisma();
  const business = await prisma.business.findUnique({ where: { id: businessId }, include: { profile: true } });
  const profile = business?.profile;
  if (!business || !profile || profile.businessType !== "LIMITED_COMPANY" || !profile.companyNumber) {
    return { skipped: true, reason: "not_eligible" };
  }

  if (!force && profile.companiesHouseLastSyncedAt) {
    const hoursSinceSync = (Date.now() - profile.companiesHouseLastSyncedAt.getTime()) / 36e5;
    if (hoursSinceSync < 20) return { skipped: true, reason: "recently_synced" };
  }

  try {
    const preview = await previewCompany(profile.companyNumber);
    const materialChanges = detectMaterialChanges(profile.companiesHouseSnapshot, preview);
    const { update } = profileUpdateFromPreview(profile, preview, { useCompaniesHouseValues: false });
    await prisma.businessProfile.update({ where: { id: profile.id }, data: update });
    const taskSync = await syncBusinessTasks(business.id, userId);
    const completed = await autoCompleteEligibleTasks(business.id, preview.companyNumber, userId);

    await prisma.auditLog.create({
      data: {
        userId,
        action: materialChanges.length ? "companies_house_changes_detected" : "companies_house_synced",
        metadata: {
          businessId: business.id,
          companyNumber: preview.companyNumber,
          materialChanges,
          taskSync,
          autoCompletedTasks: completed
        }
      }
    });

    return { skipped: false, materialChanges, taskSync, autoCompletedTasks: completed };
  } catch (error) {
    const safeMessage = error instanceof CompaniesHouseError ? error.code : "sync_failed";
    await prisma.businessProfile.update({
      where: { id: profile.id },
      data: {
        companiesHouseLastSyncedAt: new Date(),
        companiesHouseSyncStatus: "failed",
        companiesHouseSyncError: safeMessage
      }
    });
    await prisma.auditLog.create({
      data: {
        userId,
        action: "companies_house_sync_failed",
        metadata: { businessId: business.id, error: safeMessage }
      }
    });
    return { skipped: false, failed: true, error: safeMessage };
  }
}

export async function runCompaniesHouseSync({ limit = 25 }: { limit?: number } = {}) {
  const prisma = getPrisma();
  const profiles = await prisma.businessProfile.findMany({
    where: {
      businessType: "LIMITED_COMPANY",
      companyNumber: { not: null },
      OR: [
        { companiesHouseLastSyncedAt: null },
        { companiesHouseLastSyncedAt: { lt: new Date(Date.now() - 20 * 60 * 60 * 1000) } }
      ]
    },
    take: limit,
    orderBy: { companiesHouseLastSyncedAt: "asc" },
    select: { businessId: true }
  });

  const result = { processed: 0, skipped: 0, failed: 0 };
  for (const profile of profiles) {
    const sync = await syncCompaniesHouseForBusiness({ businessId: profile.businessId });
    if (sync.skipped) result.skipped += 1;
    else if ("failed" in sync && sync.failed) result.failed += 1;
    else result.processed += 1;
  }
  return result;
}
