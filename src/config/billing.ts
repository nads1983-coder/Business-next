export type BillingInterval = "monthly" | "annual";
export type StripeBillingMode = "test" | "live";

export type BillingPlan = {
  id: "business-next";
  name: string;
  description: string;
  currency: "gbp";
  displayPrice: string;
  monthlyPricePence: number;
  monthlyPriceLabel: string;
  stripeMode: StripeBillingMode;
  stripeProductId?: string;
  monthlyStripePriceId?: string;
  annualStripePriceId?: string;
  annualEnabled: boolean;
  trialDays?: number;
  active: boolean;
  checkoutEnabled: boolean;
  controlledTestEmail?: string;
  features: string[];
  cancellationWording: string;
  refundWording: string;
  comingSoonWording: string;
  founderAccessName: string;
};

const legalVersions = {
  termsVersion: "stage-3-live-owner-draft-2026-07-15",
  privacyVersion: "stage-3-live-owner-draft-2026-07-15",
  subscriptionTermsVersion: "stage-3-live-owner-draft-2026-07-15",
  effectiveDate: "15 July 2026"
} as const;

const approvedProductionAppUrl = "https://businessnext.uk";
const fallbackAppUrl = "https://files-mentioned-by-the-user-build-umber.vercel.app";
const requestedMode = process.env.BUSINESS_NEXT_STRIPE_MODE === "live" ? "live" : "test";
const checkoutExplicitlyEnabled = process.env.BUSINESS_NEXT_BILLING_ENABLED === "true";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const controlledTestEmail = process.env.BUSINESS_NEXT_TEST_EMAIL?.trim().toLowerCase() || undefined;
const configuredAppUrl =
  process.env.BUSINESS_NEXT_APPROVED_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL;

const monthlyStripePriceId =
  requestedMode === "live" ? process.env.STRIPE_LIVE_PRICE_ID_MONTHLY || undefined : process.env.STRIPE_TEST_PRICE_ID_MONTHLY || undefined;
const stripeProductId =
  requestedMode === "live" ? process.env.STRIPE_LIVE_PRODUCT_ID || undefined : process.env.STRIPE_TEST_PRODUCT_ID || undefined;
const annualStripePriceId =
  requestedMode === "live" ? undefined : process.env.STRIPE_TEST_PRICE_ID_ANNUAL || undefined;

const legalOwnerAccepted = Boolean(
  process.env.BUSINESS_NEXT_LEGAL_OWNER_ACCEPTED === "true" &&
    process.env.BUSINESS_NEXT_TERMS_VERSION_ACCEPTED === legalVersions.termsVersion &&
    process.env.BUSINESS_NEXT_PRIVACY_VERSION_ACCEPTED === legalVersions.privacyVersion &&
    process.env.BUSINESS_NEXT_SUBSCRIPTION_TERMS_VERSION_ACCEPTED === legalVersions.subscriptionTermsVersion
);

const sharedBillingConfigured = Boolean(
  checkoutExplicitlyEnabled &&
    monthlyStripePriceId &&
    stripeWebhookSecret?.startsWith("whsec_") &&
    controlledTestEmail
);

const testBillingConfigured = Boolean(
  requestedMode === "test" &&
    sharedBillingConfigured &&
    stripeSecretKey?.startsWith("sk_test_") &&
    !process.env.STRIPE_LIVE_PRICE_ID_MONTHLY
);

const liveBillingConfigured = Boolean(
  requestedMode === "live" &&
    sharedBillingConfigured &&
    stripeSecretKey?.startsWith("sk_live_") &&
    stripeProductId &&
    configuredAppUrl === approvedProductionAppUrl &&
    legalOwnerAccepted &&
    !process.env.STRIPE_TEST_PRICE_ID_MONTHLY &&
    !process.env.STRIPE_TEST_PRICE_ID_ANNUAL
);

export const billingConfig = {
  approvedProductionAppUrl,
  fallbackAppUrl,
  legalOwnerAccepted,
  plan: {
    id: "business-next",
    name: "Business Next",
    description:
      "Plain-English deadline guidance for first-time UK founders who want to know what to do next.",
    currency: "gbp",
    displayPrice: "£9 per month",
    monthlyPricePence: 900,
    monthlyPriceLabel: "£9/month",
    stripeMode: requestedMode,
    stripeProductId,
    monthlyStripePriceId,
    annualStripePriceId,
    annualEnabled: false,
    trialDays: undefined,
    active: true,
    checkoutEnabled: requestedMode === "live" ? liveBillingConfigured : testBillingConfigured,
    controlledTestEmail,
    founderAccessName: "Founder access",
    features: [
      "Personalised Companies House, Self Assessment, Corporation Tax, VAT and PAYE task guidance",
      "Plain-English explanations of what is due, when it is due and what to do next",
      "Deadline reminders when they are enabled on your account",
      "Official government source links for important obligations",
      "Task and deadline history so changes stay traceable"
    ],
    cancellationWording:
      "You can cancel at any time in the secure billing portal. Cancellation stops future renewal payments and normally takes effect at the end of the current paid monthly billing period. Access continues until that paid period ends unless Stripe confirms that access should end sooner.",
    refundWording:
      "Refund requests are reviewed through support. We will correct duplicate charges or service-access problems where Business Next or Stripe records show an error. This policy does not limit any statutory consumer rights you may have.",
    comingSoonWording:
      requestedMode === "live"
        ? "Live billing is prepared but Checkout remains restricted to the approved owner email until the domain, legal acceptance, controlled purchase and final public activation are complete."
        : "The paid plan is prepared for controlled Stripe test-mode verification only. Public Checkout remains unavailable until owner approval and live-payment activation."
  } satisfies BillingPlan,
  legal: {
    ...legalVersions,
    requiresOwnerReview: !legalOwnerAccepted
  }
} as const;

export function getApprovedPriceId(interval: BillingInterval) {
  if (interval === "annual") {
    return billingConfig.plan.annualEnabled ? billingConfig.plan.annualStripePriceId : undefined;
  }

  return billingConfig.plan.monthlyStripePriceId;
}

export function getApprovedStripePriceIds() {
  return [
    billingConfig.plan.monthlyStripePriceId,
    billingConfig.plan.annualEnabled ? billingConfig.plan.annualStripePriceId : undefined
  ].filter(Boolean) as string[];
}

export function isApprovedStripePriceId(priceId?: string | null) {
  return Boolean(priceId && getApprovedStripePriceIds().includes(priceId));
}

export function isApprovedStripeProductId(productId?: string | null) {
  return Boolean(!billingConfig.plan.stripeProductId || productId === billingConfig.plan.stripeProductId);
}

export function isCheckoutAvailable() {
  return billingConfig.plan.checkoutEnabled;
}

export function isControlledBillingTestUser(email?: string | null) {
  return Boolean(billingConfig.plan.controlledTestEmail && email?.toLowerCase() === billingConfig.plan.controlledTestEmail);
}

export function isStripeTestModeReady() {
  return testBillingConfigured;
}

export function isStripeLiveModeReady() {
  return liveBillingConfigured;
}

export function isStripeEventModeAllowed(livemode: boolean) {
  return billingConfig.plan.stripeMode === "live" ? livemode : !livemode;
}
