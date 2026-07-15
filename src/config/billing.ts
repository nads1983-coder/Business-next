export type BillingInterval = "monthly" | "annual";

export type BillingPlan = {
  id: "business-next";
  name: string;
  description: string;
  currency: "gbp";
  displayPrice: string;
  monthlyPricePence: number;
  monthlyPriceLabel: string;
  stripeMode: "test";
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

const monthlyStripePriceId = process.env.STRIPE_TEST_PRICE_ID_MONTHLY || undefined;
const annualStripePriceId = process.env.STRIPE_TEST_PRICE_ID_ANNUAL || undefined;
const checkoutExplicitlyEnabled = process.env.BUSINESS_NEXT_BILLING_ENABLED === "true";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const controlledTestEmail = process.env.BUSINESS_NEXT_TEST_EMAIL?.trim().toLowerCase() || undefined;
const webhookSecretConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
const stripeTestSecretConfigured = Boolean(stripeSecretKey?.startsWith("sk_test_"));
const stripeLiveSecretConfigured = Boolean(stripeSecretKey?.startsWith("sk_live_"));
const testBillingConfigured = Boolean(
  checkoutExplicitlyEnabled &&
    monthlyStripePriceId &&
    webhookSecretConfigured &&
    stripeTestSecretConfigured &&
    !stripeLiveSecretConfigured
);

export const billingConfig = {
  plan: {
    id: "business-next",
    name: "Business Next",
    description:
      "Plain-English deadline guidance for first-time UK founders who want to know what to do next.",
    currency: "gbp",
    displayPrice: "£9 per month",
    monthlyPricePence: 900,
    monthlyPriceLabel: "£9/month",
    stripeMode: "test",
    monthlyStripePriceId,
    annualStripePriceId,
    annualEnabled: false,
    trialDays: undefined,
    active: true,
    checkoutEnabled: testBillingConfigured,
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
      "The paid plan is prepared for controlled Stripe test-mode verification only. Public Checkout remains unavailable until owner approval and live-payment activation."
  } satisfies BillingPlan,
  legal: {
    termsVersion: "stage-3-test-draft-2026-07-15",
    privacyVersion: "stage-3-test-draft-2026-07-15",
    subscriptionTermsVersion: "stage-3-test-draft-2026-07-15",
    effectiveDate: "15 July 2026",
    requiresOwnerReview: true
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

export function isCheckoutAvailable() {
  return billingConfig.plan.checkoutEnabled;
}

export function isControlledBillingTestUser(email?: string | null) {
  return Boolean(billingConfig.plan.controlledTestEmail && email?.toLowerCase() === billingConfig.plan.controlledTestEmail);
}

export function isStripeTestModeReady() {
  return testBillingConfigured;
}
