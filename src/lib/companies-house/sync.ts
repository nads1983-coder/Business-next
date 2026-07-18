import "server-only";

import { createHash } from "crypto";
import { Prisma, type BusinessProfile, type PrismaClient, type Task } from "@prisma/client";
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

type TaskHistoryEvidence = {
  action: string;
  metadata: Prisma.JsonValue | null;
};

const defaultCompaniesHouseSyncIntervalHours = 24;
const defaultCompaniesHouseSyncBatchSize = 25;
const maxCompaniesHouseSyncBatchSize = 50;
const defaultCompaniesHouseSyncDelayMs = 250;
const companiesHouseSyncLockId = 34716208;

const companyTaskKeys = new Set([
  "limited-company-first-accounts",
  "limited-company-confirmation-statement"
]);

const companiesHouseAutoCompletionRuleVersion = "companies-house-auto-complete-2026-07-18";
const companiesHouseChangeRuleVersion = "companies-house-change-detection-2026-07-18";

const companiesHouseMaterialChangeFields = [
  "companyName",
  "companyStatus",
  "registeredOffice",
  "companyType",
  "sicCodes",
  "accountingReferenceDay",
  "accountingReferenceMonth",
  "accountsNextDue",
  "confirmationNextDue",
  "accountsOverdue",
  "confirmationOverdue"
] satisfies Array<keyof CompaniesHousePreview>;

const companiesHouseDeadlineFields = new Set<keyof CompaniesHousePreview>([
  "companyStatus",
  "accountingReferenceDay",
  "accountingReferenceMonth",
  "accountsNextDue",
  "confirmationNextDue",
  "accountsOverdue",
  "confirmationOverdue"
]);

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function companiesHouseSyncConfig(env: NodeJS.ProcessEnv = process.env) {
  const intervalHours = positiveInteger(env.COMPANIES_HOUSE_SYNC_INTERVAL_HOURS, defaultCompaniesHouseSyncIntervalHours);
  const batchSize = Math.min(
    positiveInteger(env.COMPANIES_HOUSE_SYNC_BATCH_SIZE, defaultCompaniesHouseSyncBatchSize),
    maxCompaniesHouseSyncBatchSize
  );
  const providerDelayMs = positiveInteger(env.COMPANIES_HOUSE_SYNC_DELAY_MS, defaultCompaniesHouseSyncDelayMs);

  return { intervalHours, batchSize, providerDelayMs, maxBatchSize: maxCompaniesHouseSyncBatchSize };
}

export function companiesHouseEligibleProfileWhere(now: Date, intervalHours: number): Prisma.BusinessProfileWhereInput {
  return {
    businessType: "LIMITED_COMPANY",
    companyNumber: { not: null },
    AND: [
      { OR: [{ companiesHouseSyncStatus: null }, { companiesHouseSyncStatus: { not: "disabled" } }] },
      {
        OR: [
          { companiesHouseLastSyncedAt: null },
          { companiesHouseLastSyncedAt: { lt: new Date(now.getTime() - intervalHours * 60 * 60 * 1000) } }
        ]
      }
    ],
    business: {
      user: {
        OR: [
          { role: "ADMIN" },
          {
            entitlements: {
              some: {
                status: "ACTIVE",
                kind: { in: ["FOUNDER", "COMPLIMENTARY", "TRIAL", "PAID"] },
                OR: [{ endsAt: null }, { endsAt: { gt: now } }]
              }
            }
          },
          {
            subscriptions: {
              some: { billingStatus: { in: ["ACTIVE", "TRIALING"] } }
            }
          }
        ]
      }
    }
  };
}

function syncLog(level: "info" | "error", event: string, metadata: Record<string, unknown>) {
  console[level](JSON.stringify({ event, source: "companies_house_sync", ...metadata }));
}

function sleep(ms: number) {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

async function tryCompaniesHouseSyncLock(prisma: PrismaClient) {
  const rows = await prisma.$queryRaw<Array<{ locked: boolean }>>`
    SELECT pg_try_advisory_lock(${companiesHouseSyncLockId}) AS locked
  `;
  return rows[0]?.locked === true;
}

async function releaseCompaniesHouseSyncLock(prisma: PrismaClient) {
  await prisma.$queryRaw<Array<{ unlocked: boolean }>>`
    SELECT pg_advisory_unlock(${companiesHouseSyncLockId}) AS unlocked
  `;
}

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

export function companiesHouseSnapshotUpdate(preview: CompaniesHousePreview, syncedAt = new Date()) {
  return {
    companiesHouseConnectedAt: syncedAt,
    companiesHouseLastSyncedAt: syncedAt,
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
  } satisfies Prisma.BusinessProfileCreateInput | Prisma.BusinessProfileUpdateInput;
}

export function detectMaterialChanges(
  previous: Prisma.JsonValue | null | undefined,
  next: CompaniesHousePreview
) {
  if (!previous || typeof previous !== "object" || Array.isArray(previous)) return [];
  const prior = previous as Record<string, unknown>;

  return companiesHouseMaterialChangeFields.filter((field) => (
    Object.prototype.hasOwnProperty.call(prior, field) &&
    stableJson(prior[field]) !== stableJson(next[field])
  ));
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function valueHash(value: unknown) {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function nullableJson(value: unknown) {
  return value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue;
}

function changeAffectsDeadlines(field: keyof CompaniesHousePreview) {
  return companiesHouseDeadlineFields.has(field);
}

export type CompaniesHouseChangeRecordInput = {
  businessId: string;
  companyNumber: string;
  field: keyof CompaniesHousePreview;
  previousValue: Prisma.JsonValue;
  newValue: Prisma.JsonValue;
  previousValueHash: string;
  newValueHash: string;
  detectedAt: Date;
  sourceCheckedAt: Date;
  affectsDeadlines: boolean;
};

export function buildCompaniesHouseChangeRecords({
  businessId,
  companyNumber,
  previous,
  next,
  checkedAt
}: {
  businessId: string;
  companyNumber: string;
  previous: Prisma.JsonValue | null | undefined;
  next: CompaniesHousePreview;
  checkedAt: Date;
}): CompaniesHouseChangeRecordInput[] {
  if (!previous || typeof previous !== "object" || Array.isArray(previous)) return [];
  const prior = previous as Record<string, Prisma.JsonValue>;

  return detectMaterialChanges(previous, next).map((field) => {
    const previousValue = prior[field] ?? null;
    const newValue = (next[field] ?? null) as Prisma.JsonValue;

    return {
      businessId,
      companyNumber: normaliseCompanyNumber(companyNumber),
      field,
      previousValue,
      newValue,
      previousValueHash: valueHash(previousValue),
      newValueHash: valueHash(newValue),
      detectedAt: checkedAt,
      sourceCheckedAt: checkedAt,
      affectsDeadlines: changeAffectsDeadlines(field)
    };
  });
}

async function recordCompaniesHouseChanges({
  businessId,
  companyNumber,
  previous,
  next,
  checkedAt
}: {
  businessId: string;
  companyNumber: string;
  previous: Prisma.JsonValue | null | undefined;
  next: CompaniesHousePreview;
  checkedAt: Date;
}) {
  const prisma = getPrisma();
  const changes = buildCompaniesHouseChangeRecords({ businessId, companyNumber, previous, next, checkedAt });
  const saved: Array<{ id: string; field: string; affectsDeadlines: boolean }> = [];

  for (const change of changes) {
    const record = await prisma.companiesHouseChange.upsert({
      where: {
        businessId_companyNumber_field_previousValueHash_newValueHash: {
          businessId: change.businessId,
          companyNumber: change.companyNumber,
          field: change.field,
          previousValueHash: change.previousValueHash,
          newValueHash: change.newValueHash
        }
      },
      create: {
        businessId: change.businessId,
        companyNumber: change.companyNumber,
        field: change.field,
        previousValue: nullableJson(change.previousValue),
        newValue: nullableJson(change.newValue),
        previousValueHash: change.previousValueHash,
        newValueHash: change.newValueHash,
        detectedAt: change.detectedAt,
        sourceCheckedAt: change.sourceCheckedAt,
        affectsDeadlines: change.affectsDeadlines
      },
      update: {
        sourceCheckedAt: change.sourceCheckedAt
      },
      select: { id: true, field: true, affectsDeadlines: true }
    });
    saved.push(record);
  }

  return saved;
}

function filingDate(filing: CompaniesHouseFilingItem) {
  return toDate(filing.date);
}

function filingEvidenceKey(companyNumber: string, filing: CompaniesHouseFilingItem) {
  return [
    normaliseCompanyNumber(companyNumber),
    filing.category ?? "unknown-category",
    filing.type ?? "unknown-type",
    filing.date ?? "unknown-date",
    filing.description ?? "unknown-description"
  ].join(":");
}

function filingKind(filing: CompaniesHouseFilingItem, kind: "accounts" | "confirmation") {
  const acceptedTypes =
    kind === "accounts"
      ? new Set(["AA", "AA01", "DCA"])
      : new Set(["CS01", "AR01"]);
  const categoryMatch =
    kind === "accounts"
      ? filing.category === "accounts"
      : filing.category === "confirmation-statement" || filing.category === "annual-return";
  return categoryMatch && !!filing.date && (!filing.type || acceptedTypes.has(filing.type));
}

function hasUsedCompaniesHouseEvidence(
  task: { history: TaskHistoryEvidence[] },
  evidenceKey: string
) {
  return task.history.some((item) => {
    if (item.action !== "COMPLETED" || !item.metadata || typeof item.metadata !== "object" || Array.isArray(item.metadata)) {
      return false;
    }
    const metadata = item.metadata as Record<string, unknown>;
    return metadata.source === "companies_house" && metadata.evidenceKey === evidenceKey;
  });
}

export function isUnambiguousFilingForTask(
  task: Pick<Task, "createdAt" | "dueDate" | "status"> & { history: TaskHistoryEvidence[] },
  filing: CompaniesHouseFilingItem,
  companyNumber = ""
) {
  if (!task.dueDate || task.status === "COMPLETED" || task.status === "NOT_APPLICABLE" || !filing.date) {
    return null;
  }

  const filedOn = filingDate(filing);
  if (!filedOn) return null;
  if (filedOn < task.createdAt) return null;

  const latestReasonableFilingDate = addDays(task.dueDate, 45);
  if (filedOn > latestReasonableFilingDate) return null;
  if (companyNumber && hasUsedCompaniesHouseEvidence(task, filingEvidenceKey(companyNumber, filing))) return null;

  return filedOn;
}

function relevantFilingForTask(
  task: Pick<Task, "createdAt" | "dueDate" | "status"> & { history: TaskHistoryEvidence[] },
  items: CompaniesHouseFilingItem[],
  kind: "accounts" | "confirmation",
  companyNumber: string
) {
  return items
    .filter((item) => filingKind(item, kind))
    .map((item) => ({ item, filedOn: isUnambiguousFilingForTask(task, item, companyNumber) }))
    .filter((entry): entry is { item: CompaniesHouseFilingItem; filedOn: Date } => !!entry.filedOn)
    .sort((left, right) => {
      const byDate = right.filedOn.getTime() - left.filedOn.getTime();
      if (byDate !== 0) return byDate;
      return filingEvidenceKey(companyNumber, left.item).localeCompare(filingEvidenceKey(companyNumber, right.item));
    })[0]?.item ?? null;
}

async function autoCompleteTask({
  task,
  filing,
  userId,
  companyNumber,
  checkedAt,
  previousSnapshot,
  nextSnapshot
}: {
  task: Task & { history: TaskHistoryEvidence[] };
  filing: CompaniesHouseFilingItem;
  userId: string | null | undefined;
  companyNumber: string;
  checkedAt: Date;
  previousSnapshot: Prisma.JsonValue | null | undefined;
  nextSnapshot: Prisma.InputJsonValue;
}) {
  const filedOn = isUnambiguousFilingForTask(task, filing, companyNumber);
  if (!filedOn) return false;

  const note = `Companies House shows that this filing was recorded on ${format(filedOn, "d MMMM yyyy")}, so this task was marked complete automatically.`;
  const evidenceKey = filingEvidenceKey(companyNumber, filing);
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
            filingDate: filing.date ?? null,
            filingDescription: filing.description ?? null,
            filingDescriptionValues: filing.description_values ?? null,
            companyNumber: normaliseCompanyNumber(companyNumber),
            evidenceKey,
            detectedAt: checkedAt.toISOString(),
            companiesHouseCheckedAt: checkedAt.toISOString(),
            previousSourceValues: previousSnapshot ?? null,
            newSourceValues: nextSnapshot,
            ruleVersion: companiesHouseAutoCompletionRuleVersion,
            sourceUrl: `https://find-and-update.company-information.service.gov.uk/company/${encodeURIComponent(normaliseCompanyNumber(companyNumber))}/filing-history`,
            explanation: note,
            automated: true
          }
        }
      }
    }
  });
  return true;
}

async function autoCompleteEligibleTasks({
  businessId,
  companyNumber,
  userId,
  checkedAt,
  previousSnapshot,
  nextSnapshot
}: {
  businessId: string;
  companyNumber: string;
  userId?: string | null;
  checkedAt: Date;
  previousSnapshot: Prisma.JsonValue | null | undefined;
  nextSnapshot: Prisma.InputJsonValue;
}) {
  let filingHistory;
  try {
    filingHistory = await lookupCompanyFilingHistory(companyNumber);
  } catch {
    return 0;
  }
  const items = filingHistory.items ?? [];
  const prisma = getPrisma();
  const tasks = await prisma.task.findMany({
    where: { businessId, key: { in: Array.from(companyTaskKeys) } },
    include: { history: true }
  });

  let completed = 0;

  for (const task of tasks) {
    const accounts = relevantFilingForTask(task, items, "accounts", companyNumber);
    const confirmation = relevantFilingForTask(task, items, "confirmation", companyNumber);
    if (task.key === "limited-company-first-accounts" && accounts) {
      if (await autoCompleteTask({ task, filing: accounts, userId, companyNumber, checkedAt, previousSnapshot, nextSnapshot })) completed += 1;
    }
    if (task.key === "limited-company-confirmation-statement" && confirmation) {
      if (await autoCompleteTask({ task, filing: confirmation, userId, companyNumber, checkedAt, previousSnapshot, nextSnapshot })) completed += 1;
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

  const checkedAt = new Date();
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
  const completed = await autoCompleteEligibleTasks({
    businessId: business.id,
    companyNumber: preview.companyNumber,
    userId,
    checkedAt,
    previousSnapshot: business.profile.companiesHouseSnapshot,
    nextSnapshot: preview.snapshot
  });

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
    const checkedAt = new Date();
    const preview = await previewCompany(profile.companyNumber);
    const changeRecords = await recordCompaniesHouseChanges({
      businessId: business.id,
      companyNumber: preview.companyNumber,
      previous: profile.companiesHouseSnapshot,
      next: preview,
      checkedAt
    });
    const materialChanges = changeRecords.map((change) => change.field);
    const { update } = profileUpdateFromPreview(profile, preview, { useCompaniesHouseValues: false });
    await prisma.businessProfile.update({ where: { id: profile.id }, data: update });
    const hasDeadlineChanges = changeRecords.some((change) => change.affectsDeadlines);
    const taskSync = hasDeadlineChanges || force
      ? await syncBusinessTasks(business.id, userId)
      : { created: 0, updated: 0, skipped: 0, reason: "no_deadline_affecting_companies_house_changes" };
    const completed = await autoCompleteEligibleTasks({
      businessId: business.id,
      companyNumber: preview.companyNumber,
      userId,
      checkedAt,
      previousSnapshot: profile.companiesHouseSnapshot,
      nextSnapshot: preview.snapshot
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: materialChanges.length ? "companies_house_changes_detected" : "companies_house_synced",
        metadata: {
          businessId: business.id,
          companyNumber: preview.companyNumber,
          materialChanges,
          changeRecordIds: changeRecords.map((change) => change.id),
          changeRuleVersion: companiesHouseChangeRuleVersion,
          deadlineRecalculationTriggered: hasDeadlineChanges || force,
          taskSync,
          autoCompletedTasks: completed
        }
      }
    });

    return { skipped: false, materialChanges, changeRecords: changeRecords.length, taskSync, autoCompletedTasks: completed };
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

export async function runCompaniesHouseSync({ limit }: { limit?: number } = {}) {
  const prisma = getPrisma();
  const config = companiesHouseSyncConfig();
  const batchLimit = Math.min(limit ?? config.batchSize, config.maxBatchSize);
  const locked = await tryCompaniesHouseSyncLock(prisma);

  if (!locked) {
    const result = { processed: 0, skipped: 0, failed: 0, locked: true };
    syncLog("info", "companies_house_sync_skipped_overlap", result);
    return result;
  }

  try {
    const startedAt = new Date();
    const profiles = await prisma.businessProfile.findMany({
      where: companiesHouseEligibleProfileWhere(startedAt, config.intervalHours),
      take: batchLimit,
      orderBy: { companiesHouseLastSyncedAt: "asc" },
      select: { businessId: true }
    });

    const result = { processed: 0, skipped: 0, failed: 0, locked: false };
    syncLog("info", "companies_house_sync_started", {
      batchLimit,
      eligibleSelected: profiles.length,
      intervalHours: config.intervalHours
    });

    for (const [index, profile] of profiles.entries()) {
      try {
        const sync = await syncCompaniesHouseForBusiness({ businessId: profile.businessId });
        if (sync.skipped) result.skipped += 1;
        else if ("failed" in sync && sync.failed) result.failed += 1;
        else result.processed += 1;
      } catch (error) {
        result.failed += 1;
        syncLog("error", "companies_house_sync_business_failed", {
          businessId: profile.businessId,
          error: error instanceof Error ? error.message : "unknown"
        });
      }

      if (index < profiles.length - 1) {
        await sleep(config.providerDelayMs);
      }
    }

    syncLog("info", "companies_house_sync_finished", result);
    return result;
  } finally {
    await releaseCompaniesHouseSyncLock(prisma);
  }
}
