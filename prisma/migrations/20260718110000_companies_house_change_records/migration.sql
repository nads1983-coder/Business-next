CREATE TABLE "CompaniesHouseChange" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "companyNumber" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB,
    "previousValueHash" TEXT NOT NULL,
    "newValueHash" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceCheckedAt" TIMESTAMP(3) NOT NULL,
    "affectsDeadlines" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "notificationSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompaniesHouseChange_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompaniesHouseChange_businessId_companyNumber_field_previousValueHash_newValueHash_key" ON "CompaniesHouseChange"("businessId", "companyNumber", "field", "previousValueHash", "newValueHash");

CREATE INDEX "CompaniesHouseChange_businessId_acknowledgedAt_detectedAt_idx" ON "CompaniesHouseChange"("businessId", "acknowledgedAt", "detectedAt");

ALTER TABLE "CompaniesHouseChange" ADD CONSTRAINT "CompaniesHouseChange_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
