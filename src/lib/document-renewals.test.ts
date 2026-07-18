import { describe, expect, it } from "vitest";
import type { Document, DocumentReminderDelivery } from "@prisma/client";
import {
  deriveDocumentStatus,
  documentDeliveryAlreadyBlocks,
  documentReminderDecisionFor,
  nextRenewalDate
} from "./document-renewals";

function document(overrides: Partial<Document> = {}) {
  return {
    id: "doc-1",
    businessId: "business-1",
    kind: "PUBLIC_LIABILITY_INSURANCE",
    renewalDate: new Date("2026-08-13T00:00:00.000Z"),
    status: "ACTIVE",
    archivedAt: null,
    reminderPreference: "standard",
    ...overrides
  } as Pick<Document, "id" | "businessId" | "kind" | "renewalDate" | "status" | "archivedAt" | "reminderPreference">;
}

describe("document renewal tracking", () => {
  it("derives active, expiring, expired and archived status from renewal state", () => {
    const today = new Date("2026-07-14T10:00:00.000Z");

    expect(deriveDocumentStatus(document(), today)).toBe("EXPIRING_SOON");
    expect(deriveDocumentStatus(document({ renewalDate: new Date("2026-10-01T00:00:00.000Z") }), today)).toBe("ACTIVE");
    expect(deriveDocumentStatus(document({ renewalDate: new Date("2026-07-01T00:00:00.000Z") }), today)).toBe("EXPIRED");
    expect(deriveDocumentStatus(document({ status: "ARCHIVED", archivedAt: new Date("2026-07-01T00:00:00.000Z") }), today)).toBe("ARCHIVED");
    expect(deriveDocumentStatus(document({ status: "NO_LONGER_REQUIRED" }), today)).toBe("NO_LONGER_REQUIRED");
  });

  it("calculates the next renewal date for supported repeat periods", () => {
    const current = new Date("2026-07-31T00:00:00.000Z");

    expect(nextRenewalDate(current, "MONTHLY")?.toISOString().slice(0, 10)).toBe("2026-08-31");
    expect(nextRenewalDate(current, "QUARTERLY")?.toISOString().slice(0, 10)).toBe("2026-10-31");
    expect(nextRenewalDate(current, "ANNUALLY")?.toISOString().slice(0, 10)).toBe("2027-07-31");
    expect(nextRenewalDate(current, "CUSTOM")).toBeNull();
  });

  it("builds deterministic reminder keys and honours reminder preferences", () => {
    const today = new Date("2026-07-14T10:00:00.000Z");
    const standard = documentReminderDecisionFor({ document: document(), today });
    const reduced = documentReminderDecisionFor({ document: document({ reminderPreference: "reduced" }), today });
    const off = documentReminderDecisionFor({ document: document({ reminderPreference: "off" }), today });

    expect(standard).toMatchObject({ send: true, interval: "THIRTY_DAYS", stage: "early_preparation" });
    expect(reduced).toEqual({ send: false, reason: "outside_document_renewal_cadence" });
    expect(off).toEqual({ send: false, reason: "document_reminders_disabled" });
  });

  it("blocks duplicate sent deliveries and allows old failures to retry", () => {
    const today = new Date("2026-07-14T10:00:00.000Z");
    const decision = documentReminderDecisionFor({ document: document(), today });
    expect(decision).toMatchObject({ send: true });
    if (!decision.send) throw new Error("Expected reminder decision.");

    const sentDelivery = {
      dedupeKey: decision.dedupeKey,
      status: "sent",
      sentAt: today
    } as DocumentReminderDelivery;
    const oldFailure = {
      dedupeKey: decision.dedupeKey,
      status: "failed",
      sentAt: new Date("2026-07-13T10:00:00.000Z")
    } as DocumentReminderDelivery;

    expect(documentDeliveryAlreadyBlocks([sentDelivery], decision, today)).toBe(true);
    expect(documentDeliveryAlreadyBlocks([oldFailure], decision, today)).toBe(false);
  });
});
