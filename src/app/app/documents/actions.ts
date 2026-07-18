"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProductAccess } from "@/lib/billing";
import { deriveDocumentStatus, nextRenewalDate } from "@/lib/document-renewals";
import { getPrisma } from "@/lib/prisma";

const dateField = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) throw new Error("Invalid date.");
    return date;
  });

const documentMetadataSchema = z.object({
  documentId: z.string().min(1).optional(),
  kind: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(160),
  provider: z.string().trim().max(160).optional(),
  referenceNumber: z.string().trim().max(120).optional(),
  issueDate: dateField,
  startDate: dateField,
  renewalDate: dateField,
  renewalFrequency: z.enum(["NONE", "MONTHLY", "QUARTERLY", "ANNUALLY", "CUSTOM"]).default("NONE"),
  status: z.enum(["ACTIVE", "NO_LONGER_REQUIRED"]).default("ACTIVE"),
  notes: z.string().trim().max(2000).optional(),
  reminderPreference: z.enum(["standard", "reduced", "critical", "off"]).default("standard")
});

const documentIdSchema = z.object({
  documentId: z.string().min(1),
  note: z.string().trim().max(1000).optional()
});

const renewedSchema = documentIdSchema.extend({
  renewedOn: dateField,
  newRenewalDate: dateField
});

function optionalText(value: string | undefined) {
  return value?.trim() || null;
}

function parseDocumentMetadata(formData: FormData) {
  return documentMetadataSchema.parse({
    documentId: formData.get("documentId") || undefined,
    kind: formData.get("kind"),
    name: formData.get("name"),
    provider: formData.get("provider") || undefined,
    referenceNumber: formData.get("referenceNumber") || undefined,
    issueDate: formData.get("issueDate") || undefined,
    startDate: formData.get("startDate") || undefined,
    renewalDate: formData.get("renewalDate") || undefined,
    renewalFrequency: formData.get("renewalFrequency") || "NONE",
    status: formData.get("status") || "ACTIVE",
    notes: formData.get("notes") || undefined,
    reminderPreference: formData.get("reminderPreference") || "standard"
  });
}

async function getOwnedBusiness(userId: string) {
  const prisma = getPrisma();
  const business = await prisma.business.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  if (!business) {
    throw new Error("Add your business details before tracking document renewals.");
  }

  return business;
}

async function getOwnedDocument(documentId: string, userId: string) {
  const prisma = getPrisma();
  const document = await prisma.document.findFirst({
    where: { id: documentId, business: { userId } },
    include: { business: true }
  });

  if (!document) {
    throw new Error("Document not found.");
  }

  return document;
}

function revalidateDocuments() {
  revalidatePath("/app");
  revalidatePath("/app/documents");
}

export async function createDocumentAction(formData: FormData) {
  const { user } = await requireProductAccess();
  const parsed = parseDocumentMetadata(formData);
  const prisma = getPrisma();
  const business = await getOwnedBusiness(user.id);
  const status =
    parsed.status === "NO_LONGER_REQUIRED"
      ? "NO_LONGER_REQUIRED"
      : deriveDocumentStatus({ status: "ACTIVE", renewalDate: parsed.renewalDate, archivedAt: null });

  await prisma.$transaction(async (tx) => {
    const document = await tx.document.create({
      data: {
        businessId: business.id,
        kind: parsed.kind,
        name: parsed.name,
        provider: optionalText(parsed.provider),
        referenceNumber: optionalText(parsed.referenceNumber),
        issueDate: parsed.issueDate,
        startDate: parsed.startDate,
        renewalDate: parsed.renewalDate,
        renewalFrequency: parsed.renewalFrequency,
        status,
        notes: optionalText(parsed.notes),
        reminderPreference: parsed.reminderPreference,
        createdByUserId: user.id,
        renewalHistory: {
          create: {
            userId: user.id,
            action: "created",
            newRenewalDate: parsed.renewalDate,
            newStatus: status
          }
        }
      }
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "document_created",
        metadata: { businessId: business.id, documentId: document.id, kind: parsed.kind }
      }
    });
  });

  revalidateDocuments();
}

export async function updateDocumentAction(formData: FormData) {
  const { user } = await requireProductAccess();
  const parsed = parseDocumentMetadata(formData);
  if (!parsed.documentId) throw new Error("Document is required.");

  const prisma = getPrisma();
  const document = await getOwnedDocument(parsed.documentId, user.id);
  const status =
    parsed.status === "NO_LONGER_REQUIRED"
      ? "NO_LONGER_REQUIRED"
      : deriveDocumentStatus({
          status: "ACTIVE",
          renewalDate: parsed.renewalDate,
          archivedAt: document.archivedAt
        });

  await prisma.$transaction([
    prisma.document.update({
      where: { id: document.id },
      data: {
        kind: parsed.kind,
        name: parsed.name,
        provider: optionalText(parsed.provider),
        referenceNumber: optionalText(parsed.referenceNumber),
        issueDate: parsed.issueDate,
        startDate: parsed.startDate,
        renewalDate: parsed.renewalDate,
        renewalFrequency: parsed.renewalFrequency,
        status,
        notes: optionalText(parsed.notes),
        reminderPreference: parsed.reminderPreference
      }
    }),
    prisma.documentRenewalHistory.create({
      data: {
        documentId: document.id,
        userId: user.id,
        action: "updated_metadata",
        previousRenewalDate: document.renewalDate,
        newRenewalDate: parsed.renewalDate,
        previousStatus: document.status,
        newStatus: status
      }
    }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "document_updated",
        metadata: { businessId: document.businessId, documentId: document.id, kind: parsed.kind }
      }
    })
  ]);

  revalidateDocuments();
}

export async function markDocumentRenewedAction(formData: FormData) {
  const { user } = await requireProductAccess();
  const parsed = renewedSchema.parse({
    documentId: formData.get("documentId"),
    renewedOn: formData.get("renewedOn") || undefined,
    newRenewalDate: formData.get("newRenewalDate") || undefined,
    note: formData.get("note") || undefined
  });
  const prisma = getPrisma();
  const document = await getOwnedDocument(parsed.documentId, user.id);
  const renewedOn = parsed.renewedOn ?? new Date();
  const nextDate = parsed.newRenewalDate ?? (document.renewalDate ? nextRenewalDate(document.renewalDate, document.renewalFrequency) : null);
  const status = nextDate
    ? deriveDocumentStatus({ status: "ACTIVE", renewalDate: nextDate, archivedAt: null })
    : "RENEWED";

  await prisma.$transaction([
    prisma.document.update({
      where: { id: document.id },
      data: {
        startDate: renewedOn,
        renewalDate: nextDate,
        status,
        archivedAt: null
      }
    }),
    prisma.documentRenewalHistory.create({
      data: {
        documentId: document.id,
        userId: user.id,
        action: "renewed",
        previousRenewalDate: document.renewalDate,
        newRenewalDate: nextDate,
        previousStatus: document.status,
        newStatus: status,
        note: optionalText(parsed.note)
      }
    }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "document_renewed",
        metadata: { businessId: document.businessId, documentId: document.id, kind: document.kind }
      }
    })
  ]);

  revalidateDocuments();
}

export async function archiveDocumentAction(formData: FormData) {
  const { user } = await requireProductAccess();
  const parsed = documentIdSchema.parse({
    documentId: formData.get("documentId"),
    note: formData.get("note") || undefined
  });
  const prisma = getPrisma();
  const document = await getOwnedDocument(parsed.documentId, user.id);

  await prisma.$transaction([
    prisma.document.update({
      where: { id: document.id },
      data: { status: "ARCHIVED", archivedAt: new Date() }
    }),
    prisma.documentRenewalHistory.create({
      data: {
        documentId: document.id,
        userId: user.id,
        action: "archived",
        previousRenewalDate: document.renewalDate,
        newRenewalDate: document.renewalDate,
        previousStatus: document.status,
        newStatus: "ARCHIVED",
        note: optionalText(parsed.note)
      }
    }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "document_archived",
        metadata: { businessId: document.businessId, documentId: document.id, kind: document.kind }
      }
    })
  ]);

  revalidateDocuments();
}

export async function restoreDocumentAction(formData: FormData) {
  const { user } = await requireProductAccess();
  const parsed = documentIdSchema.parse({
    documentId: formData.get("documentId"),
    note: formData.get("note") || undefined
  });
  const prisma = getPrisma();
  const document = await getOwnedDocument(parsed.documentId, user.id);
  const status = deriveDocumentStatus({ status: "ACTIVE", renewalDate: document.renewalDate, archivedAt: null });

  await prisma.$transaction([
    prisma.document.update({
      where: { id: document.id },
      data: { status, archivedAt: null }
    }),
    prisma.documentRenewalHistory.create({
      data: {
        documentId: document.id,
        userId: user.id,
        action: "restored",
        previousRenewalDate: document.renewalDate,
        newRenewalDate: document.renewalDate,
        previousStatus: document.status,
        newStatus: status,
        note: optionalText(parsed.note)
      }
    }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "document_restored",
        metadata: { businessId: document.businessId, documentId: document.id, kind: document.kind }
      }
    })
  ]);

  revalidateDocuments();
}
