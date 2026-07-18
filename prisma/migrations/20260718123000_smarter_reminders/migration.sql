ALTER TYPE "ReminderInterval" ADD VALUE 'DUE_TODAY';

ALTER TABLE "BusinessProfile"
ADD COLUMN "reminderPreference" TEXT NOT NULL DEFAULT 'standard',
ADD COLUMN "reminderSnoozedUntil" TIMESTAMP(3),
ADD COLUMN "reminderPreferredHour" INTEGER NOT NULL DEFAULT 9,
ADD COLUMN "reminderTimezone" TEXT NOT NULL DEFAULT 'Europe/London';

ALTER TABLE "ReminderDelivery"
ADD COLUMN "stage" TEXT,
ADD COLUMN "channel" TEXT NOT NULL DEFAULT 'email',
ADD COLUMN "dedupeKey" TEXT,
ADD COLUMN "ruleVersion" TEXT,
ADD COLUMN "dueDate" TIMESTAMP(3),
ADD COLUMN "reason" TEXT,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'sent',
ADD COLUMN "error" TEXT;

DROP INDEX "ReminderDelivery_taskId_interval_key";

CREATE UNIQUE INDEX "ReminderDelivery_dedupeKey_key" ON "ReminderDelivery"("dedupeKey");

CREATE INDEX "ReminderDelivery_taskId_interval_dueDate_idx" ON "ReminderDelivery"("taskId", "interval", "dueDate");
