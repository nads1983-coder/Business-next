-- Add lightweight auth email rate-limit events.
CREATE TYPE "AuthEmailPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

CREATE TABLE "AuthEmailAttempt" (
    "id" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "purpose" "AuthEmailPurpose" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthEmailAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuthEmailAttempt_emailHash_purpose_createdAt_idx" ON "AuthEmailAttempt"("emailHash", "purpose", "createdAt");

-- Preserve access for accounts created before email verification was implemented.
UPDATE "User" SET "emailVerified" = CURRENT_TIMESTAMP WHERE "emailVerified" IS NULL;
