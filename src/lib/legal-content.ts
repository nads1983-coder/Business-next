import { billingConfig } from "@/config/billing";
import { productConfig } from "@/config/product";

const operatorName = "Nadine Pierre Ltd";
const serviceName = "BusinessSorted.uk";
const tradingName = productConfig.name;
const supportEmail = productConfig.supportEmail;
const siteDomain = "businesssorted.uk";
const governingLaw = "the laws of England and Wales";
const courts = "the courts of England and Wales";

export const legalNotice = null;

export const legalPages = {
  terms: {
    path: "/terms",
    title: "Terms and Conditions",
    version: billingConfig.legal.termsVersion,
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      [
        "Who we are",
        `${serviceName} is operated by ${operatorName}. In these Terms, "Business Sorted", "we", "us" and "our" mean ${operatorName} operating the Business Sorted service at ${siteDomain}.`
      ],
      [
        "The Service",
        `${tradingName} provides general business administration support for UK founders, including task lists, deadline reminders, plain-English explanations and links to official sources. The Service is independent and is not affiliated with GOV.UK, HMRC, Companies House or any other public body.`
      ],
      [
        "No professional advice",
        productConfig.disclaimer
      ],
      [
        "Eligibility and accounts",
        "You must provide accurate account information, keep your sign-in details secure and tell us promptly if you believe your account has been accessed without permission. You are responsible for the information you enter about yourself, your business and your filing obligations."
      ],
      [
        "Your responsibilities",
        "You remain responsible for checking official records, maintaining business records, making filings and payments on time, and deciding whether to get professional legal, tax, accounting or financial advice. You should not rely on Business Sorted as the only source for a statutory deadline or obligation."
      ],
      [
        "Official and third-party information",
        "We may use or link to official government sources and third-party services. We try to keep source links useful, but external information can change and may be unavailable. You should check the official source before acting."
      ],
      [
        "Acceptable use",
        "You must not misuse the Service, attempt to access another user's account, interfere with security, upload unlawful material, scrape the Service, or use it in a way that could damage Business Sorted or other users."
      ],
      [
        "Availability and changes",
        "We may improve, suspend, withdraw or change parts of the Service from time to time. We will take reasonable care in operating the Service, but we do not promise uninterrupted availability or that every feature will always remain available."
      ],
      [
        "Intellectual property",
        "Business Sorted content, software, design, branding and documentation belong to us or our licensors. You may use the Service for your own business administration, but you must not copy, resell or build a competing service from our content or software."
      ],
      [
        "Suspension and termination",
        "We may suspend or end access if you breach these Terms, create security or payment risk, misuse the Service, or if we need to comply with law. You may stop using the Service at any time. Subscription cancellation is explained in the Subscription and Cancellation Terms."
      ],
      [
        "Liability",
        "Nothing in these Terms excludes liability that cannot lawfully be excluded. To the extent permitted by law, Business Sorted is provided for general organisation and information support and we are not liable for penalties, missed filings, business losses, loss of profit, loss of data, or decisions made without checking official sources or getting appropriate professional advice."
      ],
      [
        "Indemnity",
        "If you use the Service in breach of these Terms or provide inaccurate information that causes a claim, cost or loss to us, you agree to compensate us for reasonably foreseeable losses arising from that breach, to the extent permitted by law."
      ],
      [
        "Changes to these Terms",
        "We may update these Terms when the Service, law, pricing or operational requirements change. The version and effective date shown on this page identify the current Terms."
      ],
      [
        "Governing law and contact",
        `These Terms are governed by ${governingLaw}, and disputes are subject to ${courts}. For account, billing or product support, contact ${supportEmail}.`
      ]
    ]
  },
  privacy: {
    path: "/privacy",
    title: "Privacy Notice",
    version: billingConfig.legal.privacyVersion,
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      [
        "Who controls your data",
        `${serviceName} is operated by ${operatorName}. ${operatorName} is the data controller for personal information processed through Business Sorted unless a separate notice says otherwise.`
      ],
      [
        "Information we collect",
        "We collect account details such as name, email address, password authentication data and email verification records; business profile details such as business name, trading name, business type, Companies House number, tax and registration information you provide; task activity, reminder settings, support messages, audit records and billing status."
      ],
      [
        "How we collect information",
        "We collect information when you create an account, complete onboarding, update settings, use task features, contact support, accept legal terms, subscribe through Stripe, or when security and operational systems create necessary records."
      ],
      [
        "How we use information",
        "We use personal information to provide and secure accounts, generate and update task lists, send service emails and reminders, manage support, process subscriptions, maintain audit trails, improve the Service, prevent misuse and meet legal or operational obligations."
      ],
      [
        "Lawful bases",
        "Our UK GDPR lawful bases may include contract where processing is needed to provide the Service, legitimate interests in running and improving Business Sorted and keeping it secure, legal obligation where records must be kept, and consent where required for optional marketing or non-essential cookies."
      ],
      [
        "Billing and subscriptions",
        "Stripe processes payments and card information. Business Sorted stores Stripe customer, subscription and price identifiers, billing interval, subscription status, current period dates, cancellation status and billing event history. We do not store complete card details."
      ],
      [
        "Analytics, cookies and communications",
        "We use essential cookies for authentication and security, internal product analytics, and Plausible analytics for public website usage. We may send service emails about account access, verification, security, billing, reminders and important Service changes. Marketing messages, where used, will provide any required unsubscribe route."
      ],
      [
        "Processors and transfers",
        "We use service providers to host the application, database, authentication, email, analytics and payments. Those providers may process personal information for us and may transfer data outside the UK. Where relevant, we rely on appropriate safeguards such as UK-approved contractual terms or provider transfer mechanisms."
      ],
      [
        "Retention and security",
        "We keep personal information only for as long as needed for the Service, support, billing records, security, audit, legal and operational requirements. We use technical and organisational measures intended to protect personal information, but no online service can guarantee absolute security."
      ],
      [
        "Your rights",
        `You may have rights to access, correct, delete, restrict or object to processing of your personal information, and to data portability where applicable. Contact ${supportEmail} to make a request. We may need to verify your identity before responding.`
      ],
      [
        "Complaints, children and changes",
        "Business Sorted is not intended for children. If you have concerns about our use of personal information, contact us first and we will try to help. You also have the right to complain to the Information Commissioner's Office. We may update this Privacy Notice, and the version and effective date shown on this page identify the current notice."
      ]
    ]
  },
  subscription: {
    path: "/subscription-terms",
    title: "Subscription and Cancellation Terms",
    version: billingConfig.legal.subscriptionTermsVersion,
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      [
        "Who these terms apply to",
        `These Subscription and Cancellation Terms apply to paid access to ${tradingName}, operated by ${operatorName}, and sit alongside the Terms and Conditions. If there is a conflict about billing or cancellation, these Subscription and Cancellation Terms apply for that issue.`
      ],
      [
        "Subscription arrangement",
        `${tradingName} currently offers one monthly subscription arrangement: ${billingConfig.plan.displayPrice} in GBP for the Business Sorted plan. Annual billing and free trials are not offered for this launch phase.`
      ],
      [
        "Payment and renewal",
        "Payment is taken through Stripe Checkout when you subscribe. The subscription renews automatically each month unless you cancel before the next renewal date. The checkout page and Stripe-hosted payment flow show the payment method and any tax or total-price information available for your purchase before payment is confirmed."
      ],
      [
        "Access after payment",
        "Paid access is granted after Business Sorted receives a verified Stripe confirmation. If payment is incomplete, disputed, reversed, past due or unpaid, access may be delayed, limited, suspended or ended."
      ],
      [
        "Upgrades and downgrades",
        "There is currently no annual plan, free trial or self-serve upgrade or downgrade path. If we introduce additional plans, prices or billing intervals, we will explain the available options before you choose them."
      ],
      [
        "Cancellation",
        billingConfig.plan.cancellationWording
      ],
      [
        "Access following cancellation",
        "When cancellation is scheduled for the end of the current paid monthly period, access normally continues until that period ends unless Stripe confirms a failed, unpaid, reversed or ended status that requires access to stop earlier. Cancelling a subscription does not automatically delete your account or business data."
      ],
      [
        "Failed payments and suspension",
        "If a renewal payment fails, Stripe may retry payment and Business Sorted may show a billing status that needs attention. We may limit or suspend paid features until the subscription is brought up to date or ended."
      ],
      [
        "Price changes",
        "We may change prices in future. If a change affects an existing subscription, we will provide notice where required and explain how the change applies before it takes effect."
      ],
      [
        "Consumer and business users",
        "Nothing in these terms removes statutory rights that cannot lawfully be excluded. If you subscribe as a business user, you confirm that you have authority to buy the subscription for that business. If you subscribe as a consumer, mandatory consumer protections continue to apply where relevant."
      ],
      [
        "Billing support",
        `For billing, subscription, cancellation, refund or account-access questions, contact ${supportEmail}. Do not send card details; Stripe handles card information.`
      ]
    ]
  },
  refunds: {
    path: "/refunds",
    title: "Refund Policy",
    version: billingConfig.legal.subscriptionTermsVersion,
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      [
        "How this policy fits with subscriptions",
        `This Refund Policy applies to paid Business Sorted subscriptions operated by ${operatorName}. It should be read with the Subscription and Cancellation Terms. Cancelling a subscription stops future renewal payments; it does not automatically create a refund for amounts already paid.`
      ],
      [
        "General refund position",
        billingConfig.plan.refundWording
      ],
      [
        "When refunds may be considered",
        "We may consider a refund where Stripe or Business Sorted records show a duplicate charge, an incorrect amount, a payment taken after a valid cancellation should have stopped renewal, or a technical issue caused by Business Sorted that prevented paid access for a material part of the paid period."
      ],
      [
        "When refunds are not normally given",
        "Refunds are not normally provided because you changed your mind after using the paid Service, forgot to cancel before renewal, did not use the Service during a paid period, or expected features that were not described as included at the time of purchase."
      ],
      [
        "Promotions",
        "If a promotional price or discount is offered, any refund will normally be assessed against the amount actually paid, not the standard monthly price."
      ],
      [
        "How to request a refund",
        `Contact ${supportEmail} with your account email, the date and amount of the charge, the reason for the request, and any relevant Stripe receipt or invoice reference. Do not send card details. We will review account, subscription and Stripe records before deciding the appropriate outcome.`
      ],
      [
        "Statutory rights",
        "Nothing in this Refund Policy removes or restricts statutory rights that cannot lawfully be excluded, including any mandatory consumer rights that apply to your purchase."
      ]
    ]
  },
  cookies: {
    path: "/cookies",
    title: "Cookie Information",
    version: billingConfig.legal.privacyVersion,
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["Who we are", `${serviceName} is operated by ${operatorName}.`],
      ["Essential cookies", "Business Sorted uses essential cookies for authentication, security and basic app operation."],
      ["Analytics", "Business Sorted uses internal, privacy-conscious event records and a Plausible analytics script to understand public website use without adding duplicate analytics providers."],
      ["Stripe", "Stripe Checkout and the Customer Portal may use their own cookies and security checks on Stripe-hosted pages."]
    ]
  },
  support: {
    path: "/support",
    title: "Contact and Support",
    version: billingConfig.legal.termsVersion,
    effectiveDate: billingConfig.legal.effectiveDate,
    sections: [
      ["Who we are", `${serviceName} is operated by ${operatorName}.`],
      ["Contact", `Email ${supportEmail} for account, billing or product support.`],
      ["Billing support", "Do not send card details. Use the secure billing portal when it is available for payment-method updates, invoice access and cancellation."],
      ["Account deletion", "Account deletion is support-led so an active subscription can be cancelled safely before irreversible data changes are made."]
    ]
  }
} as const;
