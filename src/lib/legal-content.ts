import { billingConfig } from "@/config/billing";
import { productConfig } from "@/config/product";

export const legalNotice =
  "Draft wording for owner/legal review before paid launch. This wording has not been reviewed by a solicitor.";

export const legalPages = {
  terms: {
    title: "Terms of Use",
    version: billingConfig.legal.termsVersion,
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["What Business Next does", `${productConfig.name} helps first-time founders organise business administration tasks, deadlines and source links in plain English.`],
      ["What Business Next does not do", productConfig.disclaimer],
      ["Your responsibilities", "You are responsible for checking your details, keeping records, submitting filings and payments on time, and asking a qualified professional when you need advice."],
      ["Accounts", "Keep your sign-in details secure. Tell us if you think someone else has access to your account."],
      ["Service changes", "We may improve or change features as the product develops. We will not deliberately remove your business data because a subscription ends."]
    ]
  },
  privacy: {
    title: "Privacy Notice",
    version: billingConfig.legal.privacyVersion,
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["What we collect", "We collect account details, business profile details, task activity, authentication records, billing status and support messages where you provide them."],
      ["Why we use it", "We use this information to run Business Next, secure accounts, calculate deadlines, manage billing, provide support and meet operational obligations."],
      ["Billing data", "Stripe handles card details. Business Next stores Stripe customer, subscription and price identifiers, subscription status and billing event history, not full card details."],
      ["Your choices", "You can ask for help with access, correction or deletion requests through support. Some records may need to be retained where legally or operationally required."],
      ["Privacy source note", "This draft follows the plain-language direction of the ICO right-to-be-informed guidance and requires owner/legal review before paid launch."]
    ]
  },
  subscription: {
    title: "Subscription and Cancellation Terms",
    version: billingConfig.legal.subscriptionTermsVersion,
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["Pricing", "The final Business Next price has not yet been approved. Paid Checkout will remain disabled until pricing is confirmed."],
      ["Recurring billing", "When paid billing is enabled, the price, billing period, taxes and cancellation terms must be shown before purchase."],
      ["Cancellation", billingConfig.plan.cancellationWording],
      ["Access after cancellation", "If cancellation is scheduled at the end of a paid period, access normally continues until that period ends unless Stripe confirms a status that requires access to stop earlier."],
      ["Payment problems", "If payment fails or a subscription becomes overdue, access may be limited and the billing page will provide a route to manage payment."]
    ]
  },
  refunds: {
    title: "Refund Policy",
    version: "stage-3-draft-2026-07-14",
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["Before paid launch", "No live payments are enabled yet, so no customer refunds can be processed through Business Next."],
      ["After paid launch", "Refund wording must be confirmed before live billing is activated. We will not invent statutory rights or promise refunds that have not been approved."],
      ["How to ask", "Contact support with your account email and a short explanation. Do not send card details."]
    ]
  },
  cookies: {
    title: "Cookie Information",
    version: "stage-3-draft-2026-07-14",
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["Essential cookies", "Business Next uses essential cookies for authentication, security and basic app operation."],
      ["Analytics", "Stage 3 uses internal, privacy-conscious event records. It does not add a paid analytics provider or duplicate analytics scripts."],
      ["Stripe", "When paid billing is enabled, Stripe Checkout and the Customer Portal may use their own cookies and security checks on Stripe-hosted pages."]
    ]
  },
  support: {
    title: "Contact and Support",
    version: "stage-3-draft-2026-07-14",
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["Contact", `Email ${productConfig.supportEmail} for account, billing or product support.`],
      ["Billing support", "Do not send card details. Use the secure billing portal when it is available for payment-method updates and invoice access."],
      ["Account deletion", "For Stage 3, account deletion is support-led so an active subscription can be cancelled safely before irreversible data changes are made."]
    ]
  }
} as const;
