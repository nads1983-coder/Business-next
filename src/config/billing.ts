export type BillingInterval = "monthly" | "annual";

export type BillingPlan = {
  id: "business-next";
  name: string;
  description: string;
  currency: "gbp";
  displayPrice: string;
  monthlyStripePriceId?: string;
  annualStripePriceId?: string;
  annualEnabled: boolean;
  trialDays?: number;
  active: boolean;
  checkoutEnabled: boolean;
  features: string[];
  cancellationWording: string;
  comingSoonWording: string;
  founderAccessName: string;
};

const monthlyStripePriceId = process.env.STRIPE_PRICE_ID_MONTHLY || undefined;
const annualStripePriceId = process.env.STRIPE_PRICE_ID_ANNUAL || undefined;
const checkoutExplicitlyEnabled = process.env.BUSINESS_NEXT_BILLING_ENABLED === "true";

export const billingConfig = {
  plan: {
    id: "business-next",
    name: "Business Next",
    description:
      "Plain-English deadline guidance for first-time UK founders who want to know what to do next.",
    currency: "gbp",
    displayPrice: "Price to be confirmed",
    monthlyStripePriceId,
    annualStripePriceId,
    annualEnabled: Boolean(annualStripePriceId),
    trialDays: undefined,
    active: true,
    checkoutEnabled: Boolean(checkoutExplicitlyEnabled && monthlyStripePriceId),
    founderAccessName: "Founder access",
    features: [
      "Personalised business deadlines in plain English",
      "Step-by-step task guidance with official source links",
      "Deadline reminders when they are enabled on your account",
      "Business settings that recalculate your next steps",
      "A calm dashboard for what needs attention now"
    ],
    cancellationWording:
      "When paid billing is live, cancellation will be handled through the secure billing portal. Access continues until the end of any paid billing period unless Stripe confirms that access should end sooner.",
    comingSoonWording:
      "Paid plans are not available yet because the final price has not been approved. You can create an account now, but Checkout is disabled until pricing and live-payment settings are confirmed."
  } satisfies BillingPlan,
  legal: {
    termsVersion: "stage-3-draft-2026-07-14",
    privacyVersion: "stage-3-draft-2026-07-14",
    subscriptionTermsVersion: "stage-3-draft-2026-07-14",
    effectiveDate: "14 July 2026",
    requiresOwnerReview: true
  }
} as const;

export function getApprovedPriceId(interval: BillingInterval) {
  if (interval === "annual") {
    return billingConfig.plan.annualEnabled ? billingConfig.plan.annualStripePriceId : undefined;
  }

  return billingConfig.plan.monthlyStripePriceId;
}

export function isCheckoutAvailable() {
  return billingConfig.plan.checkoutEnabled;
}
