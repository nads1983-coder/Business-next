import { billingConfig } from "@/config/billing";
import { productConfig } from "@/config/product";

export const legalNotice =
  "Draft wording for owner and professional legal review before live paid launch. This wording has not been reviewed by a solicitor and does not activate live payments.";

export const legalPages = {
  terms: {
    title: "Terms of Use",
    version: billingConfig.legal.termsVersion,
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["What Business Sorted does", `${productConfig.name} helps first-time founders organise business administration tasks, deadlines and source links in plain English.`],
      ["What Business Sorted does not do", productConfig.disclaimer],
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
      ["Why we use it", "We use this information to run Business Sorted, secure accounts, calculate deadlines, manage billing, provide support and meet operational obligations."],
      ["Billing data", "Stripe handles card details. Business Sorted stores Stripe customer, subscription and price identifiers, subscription status and billing event history, not full card details."],
      ["Your choices", "You can ask for help with access, correction or deletion requests through support. Some records may need to be retained where legally or operationally required."],
      ["Privacy source note", "This draft follows the plain-language direction of the ICO right-to-be-informed guidance and requires owner/legal review before paid launch."]
    ]
  },
  subscription: {
    title: "Subscription and Cancellation Terms",
    version: billingConfig.legal.subscriptionTermsVersion,
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["Pricing", "Proposed commercial policy for controlled testing: Business Sorted is £9 per month in GBP. Annual billing and free trials are not offered initially. This clause requires owner approval before public launch."],
      ["Recurring monthly billing", "Legally required pre-contract information must clearly show the product name, total price, billing period, payment method, minimum contract length and cancellation conditions before the customer places an order. Business Sorted should confirm the contract in a durable format after purchase. This clause requires professional legal review."],
      ["Cancellation", billingConfig.plan.cancellationWording],
      ["Access after cancellation", "Proposed commercial policy: when cancellation is scheduled for the end of the current paid monthly period, product access normally continues until that period ends unless Stripe confirms a failed, unpaid, reversed or ended status that requires access to stop earlier. This clause requires owner and professional legal review."],
      ["Payment problems", "If payment fails or a subscription becomes overdue, access may be limited and the billing page will provide a route to manage payment. Business Sorted will not delete customer business data solely because a renewal payment fails. This clause requires owner approval."],
      ["Consumer rights", "Nothing in these terms is intended to remove or restrict statutory consumer rights. The exact cancellation-period and digital-service wording requires professional legal review before live consumer sales."],
      ["Support contact", `For subscription, cancellation, refund or access questions, contact ${productConfig.supportEmail}. Do not send card details; Stripe handles card information.`]
    ]
  },
  refunds: {
    title: "Refund Policy",
    version: "stage-3-test-draft-2026-07-15",
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["Before live paid launch", "Live payments are not enabled. Stripe test-mode payments do not create real customer charges or real refunds."],
      ["Proposed commercial policy", billingConfig.plan.refundWording],
      ["Duplicate charges or service-access problems", "If Stripe records show a duplicate charge, incorrect charge or service-access problem caused by Business Sorted or its payment setup, Business Sorted should correct the issue and arrange any appropriate refund through Stripe. This clause requires owner approval and professional legal review."],
      ["Statutory rights", "This refund policy must not remove or restrict statutory consumer rights. The exact wording for online service cancellation rights, digital access and any immediate-service consent requires professional legal review before live billing."],
      ["How to ask", `Contact ${productConfig.supportEmail} with your account email and a short explanation. Do not send card details.`]
    ]
  },
  cookies: {
    title: "Cookie Information",
    version: "stage-3-test-draft-2026-07-15",
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["Essential cookies", "Business Sorted uses essential cookies for authentication, security and basic app operation."],
      ["Analytics", "Stage 3 uses internal, privacy-conscious event records. It does not add a paid analytics provider or duplicate analytics scripts."],
      ["Stripe", "When paid billing is enabled, Stripe Checkout and the Customer Portal may use their own cookies and security checks on Stripe-hosted pages."]
    ]
  },
  support: {
    title: "Contact and Support",
    version: "stage-3-test-draft-2026-07-15",
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["Contact", `Email ${productConfig.supportEmail} for account, billing or product support.`],
      ["Billing support", "Do not send card details. Use the secure billing portal when it is available for payment-method updates and invoice access."],
      ["Account deletion", "For Stage 3, account deletion is support-led so an active subscription can be cancelled safely before irreversible data changes are made."]
    ]
  }
} as const;
