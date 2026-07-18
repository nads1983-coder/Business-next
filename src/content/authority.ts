import { resourcePath } from "@/content/resources";

export const officialSources = {
  hmrc: {
    label: "HMRC",
    href: "https://www.gov.uk/government/organisations/hm-revenue-customs"
  },
  companiesHouse: {
    label: "Companies House",
    href: "https://www.gov.uk/government/organisations/companies-house"
  },
  vatRegistration: {
    label: "VAT registration",
    href: "https://www.gov.uk/register-for-vat"
  },
  corporationTax: {
    label: "Corporation Tax",
    href: "https://www.gov.uk/corporation-tax"
  },
  confirmationStatement: {
    label: "Confirmation statement",
    href: "https://www.gov.uk/file-your-confirmation-statement-with-companies-house"
  },
  selfAssessment: {
    label: "Self Assessment",
    href: "https://www.gov.uk/self-assessment-tax-returns"
  },
  paye: {
    label: "PAYE and payroll",
    href: "https://www.gov.uk/paye-for-employers"
  }
} as const;

export type ComparisonResource = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  summary: string;
  optionA: string;
  optionB: string;
  rows: readonly { factor: string; a: string; b: string }[];
  fits: readonly { label: string; points: readonly string[] }[];
  misconceptions: readonly string[];
  related: readonly { label: string; href: string }[];
  sources: readonly { label: string; href: string }[];
};

export const comparisonResources: readonly ComparisonResource[] = [
  {
    slug: "limited-company-vs-sole-trader",
    title: "Limited Company vs Sole Trader",
    shortTitle: "Company vs sole trader",
    description:
      "Compare limited company and sole trader admin, filing responsibilities and typical decision points for first-time UK business owners.",
    summary:
      "A limited company is a separate legal entity with Companies House filing duties. A sole trader is personally responsible for the business and normally reports profits through Self Assessment.",
    optionA: "Limited company",
    optionB: "Sole trader",
    rows: [
      {
        factor: "Public filing",
        a: "Usually files confirmation statements and accounts with Companies House.",
        b: "Does not file company accounts or confirmation statements."
      },
      {
        factor: "Tax administration",
        a: "Usually deals with Corporation Tax and director Self Assessment where relevant.",
        b: "Usually reports business profits through Self Assessment."
      },
      {
        factor: "Record keeping",
        a: "Company records and accounting records need to support filings.",
        b: "Business records need to support Self Assessment figures."
      }
    ],
    fits: [
      {
        label: "Limited company may fit when",
        points: [
          "You want a company structure and understand the extra filing duties.",
          "You are comfortable keeping company and personal finances separate."
        ]
      },
      {
        label: "Sole trader may fit when",
        points: [
          "You want simpler setup and administration at the start.",
          "You understand that you are personally responsible for the business."
        ]
      }
    ],
    misconceptions: [
      "A company is not automatically better for every owner.",
      "A sole trader can still have tax, VAT or PAYE duties depending on the business."
    ],
    related: [
      { label: "What to do after registering a limited company", href: "/guides/limited-companies/what-to-do-after-registering-a-limited-company" },
      { label: "Sole trader tax and record keeping", href: "/guides/sole-traders/sole-trader-tax-and-record-keeping-checklist" },
      { label: "Corporation Tax deadlines", href: "/guides/hmrc/corporation-tax-deadlines-for-limited-companies" }
    ],
    sources: [officialSources.companiesHouse, officialSources.hmrc, officialSources.selfAssessment]
  },
  {
    slug: "annual-accounts-vs-confirmation-statement",
    title: "Annual Accounts vs Confirmation Statement",
    shortTitle: "Accounts vs statement",
    description:
      "Understand the difference between annual accounts and confirmation statements for UK limited companies.",
    summary:
      "Annual accounts report company financial information. A confirmation statement confirms that the information Companies House holds about the company is up to date.",
    optionA: "Annual accounts",
    optionB: "Confirmation statement",
    rows: [
      {
        factor: "Main purpose",
        a: "Shows financial information for an accounting period.",
        b: "Confirms company details such as officers, registered office and share information."
      },
      {
        factor: "Typical frequency",
        a: "Normally filed after each financial year.",
        b: "Normally filed at least once every 12 months."
      },
      {
        factor: "Common mistake",
        a: "Confusing Companies House accounts with a Company Tax Return.",
        b: "Assuming no filing is needed because nothing changed."
      }
    ],
    fits: [
      {
        label: "Prepare accounts when",
        points: ["The company financial year has ended.", "You need records ready for Companies House and tax work."]
      },
      {
        label: "Prepare a confirmation statement when",
        points: ["The review period is ending.", "Company details need to be checked or updated."]
      }
    ],
    misconceptions: [
      "Filing one does not mean the other has been filed.",
      "Dormant companies can still have Companies House duties."
    ],
    related: [
      { label: "Annual accounts guide", href: resourcePath("annual-accounts-guide") },
      { label: "Confirmation statement guide", href: resourcePath("confirmation-statement-guide") },
      { label: "Companies House resources", href: "/resources/companies-house" }
    ],
    sources: [officialSources.companiesHouse, officialSources.confirmationStatement]
  },
  {
    slug: "paye-vs-self-assessment",
    title: "PAYE vs Self Assessment",
    shortTitle: "PAYE vs Self Assessment",
    description:
      "Compare PAYE and Self Assessment so new owners can see which HMRC process may apply to salaries, staff and personal tax returns.",
    summary:
      "PAYE is the employer payroll system. Self Assessment is a tax return process for people who need to report income or gains to HMRC.",
    optionA: "PAYE",
    optionB: "Self Assessment",
    rows: [
      {
        factor: "Used for",
        a: "Payroll reporting and deductions when paying employees or directors through payroll.",
        b: "Reporting personal income, including self-employment income or director income where a return is required."
      },
      {
        factor: "Timing",
        a: "Payroll reports are usually sent on or before pay day.",
        b: "Online returns for a tax year are usually due by the following 31 January."
      },
      {
        factor: "Responsible party",
        a: "The employer runs payroll and reports to HMRC.",
        b: "The individual is responsible for filing an accurate return."
      }
    ],
    fits: [
      {
        label: "PAYE may apply when",
        points: ["You employ staff.", "You pay directors or employees through payroll."]
      },
      {
        label: "Self Assessment may apply when",
        points: ["You are self-employed.", "HMRC asks you to send a tax return."]
      }
    ],
    misconceptions: [
      "PAYE and Self Assessment can both be relevant to the same business owner.",
      "Registering a company does not remove personal tax return responsibilities."
    ],
    related: [
      { label: "Small-business administration checklist", href: "/guides/business-admin/small-business-administration-checklist" },
      { label: "Sole trader tax and record keeping", href: "/guides/sole-traders/sole-trader-tax-and-record-keeping-checklist" },
      { label: "How to avoid missing deadlines", href: "/guides/business-admin/how-to-avoid-missing-companies-house-and-hmrc-deadlines" }
    ],
    sources: [officialSources.paye, officialSources.selfAssessment, officialSources.hmrc]
  }
];

export function comparisonPath(slug: string) {
  return `/comparisons/${slug}`;
}

export function getComparison(slug: string) {
  return comparisonResources.find((comparison) => comparison.slug === slug);
}

export const topicClusters = [
  {
    name: "Company formation",
    description: "Choosing a structure, registering a company and setting up first records.",
    links: [
      { label: "Company vs sole trader", href: comparisonPath("limited-company-vs-sole-trader") },
      { label: "Registering a company", href: "/guides/limited-companies/what-to-do-after-registering-a-limited-company" },
      { label: "Companies House", href: "/resources/companies-house" }
    ]
  },
  {
    name: "Tax and payroll",
    description: "Corporation Tax, VAT, PAYE and Self Assessment reminders.",
    links: [
      { label: "Corporation Tax", href: "/guides/hmrc/corporation-tax-deadlines-for-limited-companies" },
      { label: "Business admin checklist", href: "/guides/business-admin/small-business-administration-checklist" },
      { label: "PAYE vs Self Assessment", href: comparisonPath("paye-vs-self-assessment") }
    ]
  },
  {
    name: "Recurring filings",
    description: "Accounts, confirmation statements and dormant company filing duties.",
    links: [
      { label: "Accounts vs confirmation statement", href: comparisonPath("annual-accounts-vs-confirmation-statement") },
      { label: "Annual accounts", href: resourcePath("annual-accounts-guide") },
      { label: "Confirmation statement", href: resourcePath("confirmation-statement-guide") }
    ]
  }
] as const;

export const downloadableResources = [
  {
    slug: "business-deadline-calendar",
    title: "Business Deadline Calendar",
    description: "A printable first-year deadline planning sheet for Companies House, HMRC, VAT, PAYE and Self Assessment.",
    items: [
      "Add incorporation or business start date.",
      "Add Companies House confirmation statement and accounts dates where relevant.",
      "Add HMRC tax, VAT, PAYE and Self Assessment dates that apply.",
      "Check each date against the official account before acting.",
      "Set preparation reminders at least one month before major filing dates."
    ],
    sources: [officialSources.companiesHouse, officialSources.hmrc]
  },
  {
    slug: "companies-house-checklist",
    title: "Companies House Checklist",
    description: "A printable checklist for company directors preparing Companies House filings.",
    items: [
      "Check registered office, directors and people with significant control.",
      "Review the confirmation statement due date.",
      "Prepare annual accounts from company records.",
      "Do not confuse Companies House accounts with HMRC tax returns.",
      "Keep confirmation receipts and filing references."
    ],
    sources: [officialSources.companiesHouse, officialSources.confirmationStatement]
  },
  {
    slug: "vat-registration-checklist",
    title: "VAT Registration Checklist",
    description: "A printable VAT preparation checklist for first-time business owners.",
    items: [
      "Check whether taxable turnover is approaching the VAT registration threshold.",
      "Confirm what counts as taxable turnover using official VAT guidance.",
      "Choose records that can support VAT returns.",
      "Plan invoice and pricing changes before registration starts.",
      "Check filing and payment dates inside the VAT account."
    ],
    sources: [officialSources.vatRegistration, officialSources.hmrc]
  }
] as const;

export function downloadPath(slug: string) {
  return `/downloads/${slug}`;
}

export function getDownload(slug: string) {
  return downloadableResources.find((download) => download.slug === slug);
}

export const monthlyUpdates = [
  {
    slug: "july-2026",
    title: "July 2026 business admin update",
    summary:
      "A freshness hub for Business Sorted guidance. No change is treated as confirmed unless it can be checked against official HMRC, Companies House or GOV.UK pages.",
    checked: "18 July 2026",
    items: [
      "Resource guides reviewed for official-source alignment.",
      "Sitemap and robots checks repeated after production deployment.",
      "New comparison and calculator pages added to help owners choose the next official source to check."
    ]
  }
] as const;
