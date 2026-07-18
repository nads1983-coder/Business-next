import { createHash } from "crypto";
import type { Document, DocumentReminderDelivery, ReminderInterval } from "@prisma/client";
import { addMonths, differenceInCalendarDays } from "date-fns";
import { parseUkDate } from "@/lib/task-engine";

export const documentRenewalRuleVersion = "document-renewals-2026-07-18";
export const documentRenewalChannel = "email";

export const documentTypeOptions = [
  ["BUSINESS_INSURANCE", "Business insurance"],
  ["PUBLIC_LIABILITY_INSURANCE", "Public liability insurance"],
  ["PROFESSIONAL_INDEMNITY_INSURANCE", "Professional indemnity insurance"],
  ["EMPLOYERS_LIABILITY_INSURANCE", "Employer's liability insurance"],
  ["CYBER_INSURANCE", "Cyber insurance"],
  ["ICO_REGISTRATION", "Data protection or ICO registration evidence"],
  ["LICENCE", "Licence"],
  ["PERMIT", "Permit"],
  ["CERTIFICATION", "Certification"],
  ["CONTRACT", "Contract"],
  ["LEASE", "Lease document"],
  ["DOMAIN_RENEWAL", "Domain renewal"],
  ["OTHER", "Other"]
] as const;

export const renewalFrequencyOptions = [
  ["NONE", "No repeat"],
  ["MONTHLY", "Monthly"],
  ["QUARTERLY", "Quarterly"],
  ["ANNUALLY", "Annually"],
  ["CUSTOM", "Custom"]
] as const;

export type DocumentRenewalStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "RENEWED" | "NO_LONGER_REQUIRED" | "ARCHIVED";

type DocumentReminderPreference = "standard" | "reduced" | "critical" | "off";
type DocumentReminderStage = "early_preparation" | "expiring_soon" | "urgent" | "expired";

type DocumentReminderDecision =
  | {
      send: true;
      interval: ReminderInterval;
      stage: DocumentReminderStage;
      dedupeKey: string;
      reason: string;
      daysRemainingText: string;
      renewalDate: Date;
      ruleVersion: string;
    }
  | { send: false; reason: string };

function normalisePreference(value: string | null | undefined): DocumentReminderPreference {
  if (value === "reduced" || value === "critical" || value === "off") return value;
  return "standard";
}

export function documentTypeLabel(kind: string) {
  return documentTypeOptions.find(([value]) => value === kind)?.[1] ?? kind;
}

export function renewalFrequencyLabel(frequency: string | null | undefined) {
  return renewalFrequencyOptions.find(([value]) => value === frequency)?.[1] ?? "No repeat";
}

export function deriveDocumentStatus(
  document: Pick<Document, "status" | "renewalDate" | "archivedAt">,
  today = new Date()
): DocumentRenewalStatus {
  if (document.archivedAt || document.status === "ARCHIVED") return "ARCHIVED";
  if (document.status === "NO_LONGER_REQUIRED") return "NO_LONGER_REQUIRED";
  if (document.status === "RENEWED") return "RENEWED";
  if (!document.renewalDate) return "ACTIVE";

  const days = differenceInCalendarDays(parseUkDate(document.renewalDate) ?? document.renewalDate, parseUkDate(today) ?? today);
  if (days < 0) return "EXPIRED";
  if (days <= 30) return "EXPIRING_SOON";
  return "ACTIVE";
}

function daysRemainingText(days: number) {
  if (days === 0) return "expires today";
  if (days === 1) return "expires tomorrow";
  if (days > 1) return `expires in ${days} days`;
  if (days === -1) return "expired 1 day ago";
  return `expired ${Math.abs(days)} days ago`;
}

function documentReminderHash(parts: Record<string, string | number | null>) {
  return createHash("sha256")
    .update(JSON.stringify(Object.keys(parts).sort().map((key) => [key, parts[key]])))
    .digest("hex");
}

export function nextRenewalDate(current: Date, frequency: string | null | undefined) {
  if (frequency === "MONTHLY") return addMonths(current, 1);
  if (frequency === "QUARTERLY") return addMonths(current, 3);
  if (frequency === "ANNUALLY") return addMonths(current, 12);
  return null;
}

export function documentReminderDecisionFor({
  document,
  today = new Date()
}: {
  document: Pick<Document, "id" | "businessId" | "kind" | "renewalDate" | "status" | "archivedAt" | "reminderPreference">;
  today?: Date;
}): DocumentReminderDecision {
  const preference = normalisePreference(document.reminderPreference);
  if (preference === "off") return { send: false, reason: "document_reminders_disabled" };
  if (document.archivedAt || document.status === "ARCHIVED") return { send: false, reason: "document_archived" };
  if (document.status === "NO_LONGER_REQUIRED") return { send: false, reason: "document_no_longer_required" };
  if (!document.renewalDate || Number.isNaN(document.renewalDate.getTime())) return { send: false, reason: "missing_or_invalid_renewal_date" };

  const renewalDate = parseUkDate(document.renewalDate) ?? document.renewalDate;
  const days = differenceInCalendarDays(renewalDate, parseUkDate(today) ?? today);
  let interval: ReminderInterval | null = null;
  let stage: DocumentReminderStage | null = null;
  let reason = "";

  if (days === 30 && preference === "standard") {
    interval = "THIRTY_DAYS";
    stage = "early_preparation";
    reason = "the document renewal date is 30 days away";
  } else if (days === 7 && preference !== "critical") {
    interval = "SEVEN_DAYS";
    stage = "expiring_soon";
    reason = "the document renewal date is 7 days away";
  } else if (days === 1 && preference !== "critical") {
    interval = "ONE_DAY";
    stage = "urgent";
    reason = "the document renewal date is tomorrow";
  } else if (days < 0 && Math.abs(days) % 7 === 0) {
    interval = "OVERDUE";
    stage = "expired";
    reason = `the document renewal date is ${Math.abs(days)} days overdue`;
  }

  if (!interval || !stage) return { send: false, reason: "outside_document_renewal_cadence" };

  const renewalIso = renewalDate.toISOString().slice(0, 10);
  return {
    send: true,
    interval,
    stage,
    dedupeKey: documentReminderHash({
      businessId: document.businessId,
      documentId: document.id,
      kind: document.kind,
      renewalDate: renewalIso,
      interval,
      stage,
      channel: documentRenewalChannel,
      ruleVersion: documentRenewalRuleVersion
    }),
    reason,
    daysRemainingText: daysRemainingText(days),
    renewalDate,
    ruleVersion: documentRenewalRuleVersion
  };
}

export function documentDeliveryAlreadyBlocks(
  deliveries: DocumentReminderDelivery[],
  decision: Extract<DocumentReminderDecision, { send: true }>,
  today = new Date()
) {
  const matching = deliveries.find((delivery) => delivery.dedupeKey === decision.dedupeKey);
  if (!matching) return false;
  if (matching.status === "sent") return true;
  if (matching.status === "failed") {
    const hoursSinceFailure = (today.getTime() - matching.sentAt.getTime()) / 36e5;
    return hoursSinceFailure < 12;
  }
  return false;
}
