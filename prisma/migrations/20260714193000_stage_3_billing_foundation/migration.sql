CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'ANNUAL', 'NONE');

CREATE TYPE "BillingSubscriptionStatus" AS ENUM (
  'CONFIGURATION_ONLY',
  'INCOMPLETE',
  'INCOMPLETE_EXPIRED',
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'UNPAID',
  'PAUSED'
);

CREATE TYPE "EntitlementKind" AS ENUM ('PAID', 'TRIAL', 'FOUNDER', 'COMPLIMENTARY', 'ADMIN');

CREATE TYPE "EntitlementStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE "BillingEventType" AS ENUM (
  'CHECKOUT_STARTED',
  'CHECKOUT_COMPLETED',
  'CUSTOMER_PORTAL_OPENED',
  'SUBSCRIPTION_CREATED',
  'SUBSCRIPTION_UPDATED',
  'SUBSCRIPTION_CANCELLED',
  'INVOICE_PAYMENT_SUCCEEDED',
  'INVOICE_PAYMENT_FAILED',
  'TRIAL_WILL_END',
  'REFUND_OR_REVERSAL',
  'ENTITLEMENT_GRANTED',
  'ENTITLEMENT_REVOKED',
  'EMAIL_QUEUED',
  'EMAIL_SKIPPED',
  'WEBHOOK_IGNORED',
  'WEBHOOK_FAILED'
);

CREATE TYPE "LegalDocumentType" AS ENUM ('TERMS_OF_USE', 'PRIVACY_NOTICE', 'SUBSCRIPTION_TERMS');

CREATE TYPE "AnalyticsEventName" AS ENUM (
  'PRICING_PAGE_VIEWED',
  'CHECKOUT_STARTED',
  'CHECKOUT_CANCELLED',
  'SUBSCRIPTION_ACTIVATED',
  'CUSTOMER_PORTAL_OPENED',
  'CANCELLATION_SCHEDULED',
  'SUBSCRIPTION_ENDED'
);

ALTER TABLE "Subscription"
  ADD COLUMN "stripePriceId" TEXT,
  ADD COLUMN "stripeProductId" TEXT,
  ADD COLUMN "billingStatus" "BillingSubscriptionStatus" NOT NULL DEFAULT 'CONFIGURATION_ONLY',
  ADD COLUMN "billingInterval" "BillingInterval" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "currentPeriodEnd" TIMESTAMP(3),
  ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "trialStart" TIMESTAMP(3),
  ADD COLUMN "trialEnd" TIMESTAMP(3),
  ADD COLUMN "purchasedAt" TIMESTAMP(3),
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "endedAt" TIMESTAMP(3),
  ADD COLUMN "latestStripeEventId" TEXT,
  ADD COLUMN "legalTermsVersion" TEXT,
  ADD COLUMN "legalPrivacyVersion" TEXT,
  ADD COLUMN "legalSubscriptionVersion" TEXT,
  ADD COLUMN "legalAcceptedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
CREATE INDEX "Subscription_userId_billingStatus_idx" ON "Subscription"("userId", "billingStatus");

CREATE TABLE "UserEntitlement" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind" "EntitlementKind" NOT NULL,
  "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
  "reason" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMP(3),
  "grantedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserEntitlement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserEntitlement_userId_kind_source_key" ON "UserEntitlement"("userId", "kind", "source");
CREATE INDEX "UserEntitlement_userId_status_idx" ON "UserEntitlement"("userId", "status");

ALTER TABLE "UserEntitlement" ADD CONSTRAINT "UserEntitlement_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "StripeWebhookEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "livemode" BOOLEAN NOT NULL,
  "userId" TEXT,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processingStatus" TEXT NOT NULL DEFAULT 'processed',
  "summary" TEXT NOT NULL,
  "errorMessage" TEXT,
  "payload" JSONB,
  CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StripeWebhookEvent_type_processedAt_idx" ON "StripeWebhookEvent"("type", "processedAt");
CREATE INDEX "StripeWebhookEvent_userId_processedAt_idx" ON "StripeWebhookEvent"("userId", "processedAt");

ALTER TABLE "StripeWebhookEvent" ADD CONSTRAINT "StripeWebhookEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "BillingEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "type" "BillingEventType" NOT NULL,
  "stripeEventId" TEXT,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "summary" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BillingEvent_userId_createdAt_idx" ON "BillingEvent"("userId", "createdAt");
CREATE INDEX "BillingEvent_type_createdAt_idx" ON "BillingEvent"("type", "createdAt");
CREATE INDEX "BillingEvent_stripeEventId_idx" ON "BillingEvent"("stripeEventId");

ALTER TABLE "BillingEvent" ADD CONSTRAINT "BillingEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "LegalAcceptance" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "document" "LegalDocumentType" NOT NULL,
  "version" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "source" TEXT NOT NULL,
  CONSTRAINT "LegalAcceptance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LegalAcceptance_userId_document_version_key" ON "LegalAcceptance"("userId", "document", "version");
CREATE INDEX "LegalAcceptance_userId_acceptedAt_idx" ON "LegalAcceptance"("userId", "acceptedAt");

ALTER TABLE "LegalAcceptance" ADD CONSTRAINT "LegalAcceptance_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "name" "AnalyticsEventName" NOT NULL,
  "path" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AnalyticsEvent_name_createdAt_idx" ON "AnalyticsEvent"("name", "createdAt");
CREATE INDEX "AnalyticsEvent_userId_createdAt_idx" ON "AnalyticsEvent"("userId", "createdAt");

ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
