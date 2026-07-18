import { legalConfig } from "@/config/legal";

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
  features: string[];
  cancellationWording: string;
  refundWording: string;
  comingSoonWording: string;
  founderAccessName: string;
};

export type CheckoutGateCategory =
  | "billing_enabled"
  | "legal_owner"
  | "legal_versions"
  | "stripe_mode"
  | "stripe_secret"
  | "stripe_webhook"
  | "stripe_product"
  | "stripe_price"
  | "approved_app_url"
  | "vercel_environment"
  | "mode_isolation";

const approvedProductionAppUrl = "https://businesssorted.uk";
const fallbackAppUrl = "https://files-mentioned-by-the-user-build-umber.vercel.app";
const requestedMode = process.env.BUSINESS_NEXT_STRIPE_MODE === "live" ? "live" : "test";
const checkoutExplicitlyEnabled = process.env.BUSINESS_NEXT_BILLING_ENABLED === "true";
const vercelEnvironment = process.env.VERCEL_ENV;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const configuredAppUrl =
  process.env.BUSINESS_NEXT_APPROVED_APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXTAUTH_URL;

const monthlyStripePriceId =
  requestedMode === "live"
    ? process.env.STRIPE_LIVE_PRICE_ID_MONTHLY || undefined
    : process.env.STRIPE_TEST_PRICE_ID_MONTHLY || undefined;
const stripeProductId =
  requestedMode === "live"
    ? process.env.STRIPE_LIVE_PRODUCT_ID || undefined
    : process.env.STRIPE_TEST_PRODUCT_ID || undefined;
const annualStripePriceId =
  requestedMode === "live" ? undefined : process.env.STRIPE_TEST_PRICE_ID_ANNUAL || undefined;

const legalOwnerFlagAccepted = process.env.BUSINESS_NEXT_LEGAL_OWNER_ACCEPTED === "true";
const legalVersionsAccepted =
  process.env.BUSINESS_NEXT_TERMS_VERSION_ACCEPTED === legalConfig.termsVersion &&
  process.env.BUSINESS_NEXT_PRIVACY_VERSION_ACCEPTED === legalConfig.privacyVersion &&
  process.env.BUSINESS_NEXT_SUBSCRIPTION_TERMS_VERSION_ACCEPTED ===
    legalConfig.subscriptionTermsVersion;
const legalOwnerAccepted = legalOwnerFlagAccepted && legalVersionsAccepted;

const sharedBillingConfigured = Boolean(
  checkoutExplicitlyEnabled &&
    monthlyStripePriceId &&
    stripeWebhookSecret?.startsWith("whsec_")
);

const testBillingConfigured = Boolean(
  requestedMode === "test" &&
    sharedBillingConfigured &&
    stripeSecretKey?.startsWith("sk_test_") &&
    !process.env.STRIPE_LIVE_PRICE_ID_MONTHLY &&
    !process.env.STRIPE_LIVE_PRODUCT_ID
);

const liveBillingConfigured = Boolean(
  requestedMode === "live" &&
    sharedBillingConfigured &&
    stripeSecretKey?.startsWith("sk_live_") &&
    stripeProductId &&
    configuredAppUrl === approvedProductionAppUrl &&
    vercelEnvironment === "production" &&
    legalOwnerAccepted &&
    !process.env.STRIPE_TEST_PRICE_ID_MONTHLY &&
    !process.env.STRIPE_TEST_PRICE_ID_ANNUAL &&
    !process.env.STRIPE_TEST_PRODUCT_ID
);

export function getCheckoutGateDiagnostics() {
  const failingCategories: CheckoutGateCategory[] = [];

  if (!checkoutExplicitlyEnabled) failingCategories.push("billing_enabled");
  if (!stripeWebhookSecret?.startsWith("whsec_")) failingCategories.push("stripe_webhook");
  if (!monthlyStripePriceId) failingCategories.push("stripe_price");
  if (!stripeSecretKey?.startsWith(requestedMode === "live" ? "sk_live_" : "sk_test_")) {
    failingCategories.push("stripe_secret");
  }

  if (requestedMode === "live") {
    if (!legalOwnerFlagAccepted) failingCategories.push("legal_owner");
    if (!legalVersionsAccepted) failingCategories.push("legal_versions");
    if (!stripeProductId) failingCategories.push("stripe_product");
    if (configuredAppUrl !== approvedProductionAppUrl) failingCategories.push("approved_app_url");
    if (vercelEnvironment !== "production") failingCategories.push("vercel_environment");
    if (
      process.env.STRIPE_TEST_PRICE_ID_MONTHLY ||
      process.env.STRIPE_TEST_PRICE_ID_ANNUAL ||
      process.env.STRIPE_TEST_PRODUCT_ID
    ) {
      failingCategories.push("mode_isolation");
    }
  } else {
    if (process.env.STRIPE_LIVE_PRICE_ID_MONTHLY || process.env.STRIPE_LIVE_PRODUCT_ID) {
      failingCategories.push("mode_isolation");
    }
    if (process.env.BUSINESS_NEXT_STRIPE_MODE && process.env.BUSINESS_NEXT_STRIPE_MODE !== "test") {
      failingCategories.push("stripe_mode");
    }
  }

  return {
    ready: requestedMode === "live" ? liveBillingConfigured : testBillingConfigured,
    failingCategories
  } as const;
}

export const billingConfig = {
  approvedProductionAppUrl,
  fallbackAppUrl,
  legalOwnerAccepted,
  plan: {
    id: "business-next",
    name: "Business Sorted",
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
    checkoutEnabled: getCheckoutGateDiagnostics().ready,
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
      "Refund requests are reviewed through support. We will correct duplicate charges or service-access problems where Business Sorted or Stripe records show an error. This policy does not limit any statutory consumer rights you may have.",
    comingSoonWording:
      requestedMode === "live"
        ? "Live billing is prepared but Checkout is unavailable until the production billing configuration is complete."
        : "The paid plan is prepared for Stripe test-mode verification only. Public Checkout requires live-payment activation."
  } satisfies BillingPlan,
  legal: {
    ...legalConfig,
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

export function isStripeTestModeReady() {
  return testBillingConfigured;
}

export function isStripeLiveModeReady() {
  return liveBillingConfigured;
}

export function isStripeEventModeAllowed(livemode: boolean) {
  return billingConfig.plan.stripeMode === "live" ? livemode : !livemode;
}
