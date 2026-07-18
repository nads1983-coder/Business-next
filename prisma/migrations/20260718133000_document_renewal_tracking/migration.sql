ALTER TABLE "Document"
ADD COLUMN "provider" TEXT,
ADD COLUMN "referenceNumber" TEXT,
ADD COLUMN "issueDate" TIMESTAMP(3),
ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "renewalDate" TIMESTAMP(3),
ADD COLUMN "renewalFrequency" TEXT,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "notes" TEXT,
ADD COLUMN "reminderPreference" TEXT NOT NULL DEFAULT 'standard',
ADD COLUMN "createdByUserId" TEXT,
ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "Document_businessId_status_renewalDate_idx" ON "Document"("businessId", "status", "renewalDate");

CREATE INDEX "Document_createdByUserId_idx" ON "Document"("createdByUserId");

ALTER TABLE "Document" ADD CONSTRAINT "Document_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "DocumentRenewalHistory" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "previousRenewalDate" TIMESTAMP(3),
    "newRenewalDate" TIMESTAMP(3),
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentRenewalHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DocumentRenewalHistory_documentId_createdAt_idx" ON "DocumentRenewalHistory"("documentId", "createdAt");

ALTER TABLE "DocumentRenewalHistory" ADD CONSTRAINT "DocumentRenewalHistory_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentRenewalHistory" ADD CONSTRAINT "DocumentRenewalHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "DocumentReminderDelivery" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "interval" "ReminderInterval" NOT NULL,
    "stage" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "dedupeKey" TEXT NOT NULL,
    "ruleVersion" TEXT NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT,
    "sentTo" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerId" TEXT,

    CONSTRAINT "DocumentReminderDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DocumentReminderDelivery_dedupeKey_key" ON "DocumentReminderDelivery"("dedupeKey");

CREATE INDEX "DocumentReminderDelivery_documentId_interval_renewalDate_idx" ON "DocumentReminderDelivery"("documentId", "interval", "renewalDate");

CREATE INDEX "DocumentReminderDelivery_sentAt_idx" ON "DocumentReminderDelivery"("sentAt");

ALTER TABLE "DocumentReminderDelivery" ADD CONSTRAINT "DocumentReminderDelivery_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
