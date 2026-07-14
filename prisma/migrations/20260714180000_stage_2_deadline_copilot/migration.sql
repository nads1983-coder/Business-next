ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'NOT_APPLICABLE';

CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "VatAccountingPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUALLY', 'NOT_SURE');
CREATE TYPE "TaskHistoryAction" AS ENUM ('CREATED', 'RECALCULATED', 'COMPLETED', 'MARKED_NOT_APPLICABLE', 'RESTORED', 'NOTE_UPDATED');
CREATE TYPE "ReminderInterval" AS ENUM ('THIRTY_DAYS', 'FOURTEEN_DAYS', 'SEVEN_DAYS', 'ONE_DAY', 'OVERDUE');

ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

ALTER TABLE "BusinessProfile"
  ADD COLUMN "legalBusinessName" TEXT,
  ADD COLUMN "tradingName" TEXT,
  ADD COLUMN "companyNumber" TEXT,
  ADD COLUMN "accountingReferenceDate" TIMESTAMP(3),
  ADD COLUMN "firstAccountingPeriodEnd" TIMESTAMP(3),
  ADD COLUMN "vatRegisteredOn" TIMESTAMP(3),
  ADD COLUMN "vatAccountingPeriod" "VatAccountingPeriod" NOT NULL DEFAULT 'NOT_SURE',
  ADD COLUMN "vatPeriodEndsOn" TIMESTAMP(3),
  ADD COLUMN "employsPeople" "AnswerChoice" NOT NULL DEFAULT 'NOT_SURE',
  ADD COLUMN "firstPayday" TIMESTAMP(3);

ALTER TABLE "Task"
  ADD COLUMN "key" TEXT,
  ADD COLUMN "nextAction" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "whatThisMeans" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "whyYouMayNeedIt" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "calculationInput" JSONB,
  ADD COLUMN "calculationExplanation" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "ruleVersion" TEXT NOT NULL DEFAULT 'stage-1',
  ADD COLUMN "sourceTitle" TEXT,
  ADD COLUMN "sourceCheckedAt" TIMESTAMP(3),
  ADD COLUMN "missingInformation" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "completedNote" TEXT,
  ADD COLUMN "notApplicableAt" TIMESTAMP(3),
  ADD COLUMN "notApplicableReason" TEXT;

CREATE UNIQUE INDEX "Task_businessId_key_key" ON "Task"("businessId", "key");
CREATE INDEX "Task_businessId_status_dueDate_idx" ON "Task"("businessId", "status", "dueDate");

CREATE TABLE "TaskHistory" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "userId" TEXT,
  "action" "TaskHistoryAction" NOT NULL,
  "note" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaskHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TaskHistory_taskId_createdAt_idx" ON "TaskHistory"("taskId", "createdAt");

ALTER TABLE "TaskHistory" ADD CONSTRAINT "TaskHistory_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskHistory" ADD CONSTRAINT "TaskHistory_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ReminderDelivery" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "interval" "ReminderInterval" NOT NULL,
  "sentTo" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "providerId" TEXT,
  CONSTRAINT "ReminderDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReminderDelivery_taskId_interval_key" ON "ReminderDelivery"("taskId", "interval");
CREATE INDEX "ReminderDelivery_sentAt_idx" ON "ReminderDelivery"("sentAt");

ALTER TABLE "ReminderDelivery" ADD CONSTRAINT "ReminderDelivery_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ComplianceRuleContentVersion" (
  "id" TEXT NOT NULL,
  "complianceRuleId" TEXT NOT NULL,
  "plainName" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "checkedAt" TIMESTAMP(3) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "changedByUserId" TEXT,
  "changeNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ComplianceRuleContentVersion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ComplianceRuleContentVersion_complianceRuleId_createdAt_idx"
  ON "ComplianceRuleContentVersion"("complianceRuleId", "createdAt");

ALTER TABLE "ComplianceRuleContentVersion" ADD CONSTRAINT "ComplianceRuleContentVersion_complianceRuleId_fkey"
  FOREIGN KEY ("complianceRuleId") REFERENCES "ComplianceRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ComplianceRuleContentVersion" ADD CONSTRAINT "ComplianceRuleContentVersion_changedByUserId_fkey"
  FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "BusinessProfile" bp
SET "legalBusinessName" = b."name",
    "employsPeople" = CASE WHEN bp."worksAlone" = 'NO' THEN 'YES'::"AnswerChoice" ELSE 'NO'::"AnswerChoice" END
FROM "Business" b
WHERE bp."businessId" = b."id"
  AND bp."legalBusinessName" IS NULL;
