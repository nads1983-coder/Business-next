ALTER TABLE "BusinessProfile"
ADD COLUMN "companiesHouseConnectedAt" TIMESTAMP(3),
ADD COLUMN "companiesHouseLastSyncedAt" TIMESTAMP(3),
ADD COLUMN "companiesHouseSyncStatus" TEXT,
ADD COLUMN "companiesHouseSyncError" TEXT,
ADD COLUMN "companiesHouseCompanyStatus" TEXT,
ADD COLUMN "companiesHouseCompanyType" TEXT,
ADD COLUMN "companiesHouseRegisteredOffice" TEXT,
ADD COLUMN "companiesHouseSicCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "companiesHouseAccountsNextDue" TIMESTAMP(3),
ADD COLUMN "companiesHouseConfirmationNextDue" TIMESTAMP(3),
ADD COLUMN "companiesHouseAccountsOverdue" BOOLEAN,
ADD COLUMN "companiesHouseConfirmationOverdue" BOOLEAN,
ADD COLUMN "companiesHouseAccountingReferenceDay" INTEGER,
ADD COLUMN "companiesHouseAccountingReferenceMonth" INTEGER,
ADD COLUMN "companiesHouseSnapshot" JSONB;

CREATE INDEX "BusinessProfile_businessType_companyNumber_companiesHouseLastSyncedAt_idx"
ON "BusinessProfile"("businessType", "companyNumber", "companiesHouseLastSyncedAt");
