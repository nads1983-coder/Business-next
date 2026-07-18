import { z } from "zod";
import { absoluteUrl } from "@/config/site";

const checkedDate = "2026-07-18";

export const resourceCategories = {
  "companies-house": {
    slug: "companies-house",
    label: "Companies House",
    description:
      "Guides for UK limited company directors who need to keep Companies House filings visible and source-linked.",
    introduction:
      "Companies House filing dates can sit alongside HMRC tax dates, but they are separate duties. These guides explain common Companies House obligations in plain English and point back to official sources before you act."
  }
} as const;

export const resourceGroups = {
  "confirmation-statements": {
    label: "Confirmation statements",
    description: "Understand what the confirmation statement is, when it is due, how to file it and what to do if it is late."
  },
  "company-accounts": {
    label: "Company accounts",
    description: "Guides to annual accounts, first accounts, late accounts and accounting reference dates."
  },
  "company-information": {
    label: "Company information",
    description: "Keep registered office, director and other company register information current."
  },
  "authentication-access": {
    label: "Authentication and access",
    description: "Understand the company authentication code and how to plan access before a filing deadline."
  },
  "dormant-companies": {
    label: "Dormant companies",
    description: "Check which Companies House filings can still apply when a company is dormant."
  },
  "directors-first-year": {
    label: "Directors and first-year requirements",
    description: "Practical Companies House responsibilities for new directors and first-year companies."
  }
} as const;

export type ResourceCategory = keyof typeof resourceCategories;
export type ResourceGroup = keyof typeof resourceGroups;

export const resourceCtaVariants = {
  "companies-house-obligations": {
    title: "Keep Companies House obligations visible",
    body:
      "BusinessSorted helps UK business owners organise and keep track of important company obligations and deadlines in one practical dashboard.",
    primaryHref: "/register",
    primaryLabel: "Start setup",
    secondaryHref: "/pricing",
    secondaryLabel: "View pricing"
  },
  "confirmation-statements": {
    title: "Keep confirmation statement tasks visible",
    body:
      "Keep your confirmation statement deadline visible alongside your other company obligations. BusinessSorted helps you organise what is due and when.",
    primaryHref: "/register",
    primaryLabel: "Start setup",
    secondaryHref: "/resources/companies-house",
    secondaryLabel: "Companies House resources"
  },
  "company-accounts": {
    title: "Keep company accounts deadlines in view",
    body:
      "Keep your company accounts deadline visible alongside the other tasks that need attention. BusinessSorted keeps important company tasks organised in one practical dashboard.",
    primaryHref: "/register",
    primaryLabel: "Start setup",
    secondaryHref: "/pricing",
    secondaryLabel: "View pricing"
  },
  "company-information": {
    title: "Keep company updates organised",
    body:
      "Keep important company updates and responsibilities organised. BusinessSorted helps you see the tasks that need your attention.",
    primaryHref: "/register",
    primaryLabel: "Start setup",
    secondaryHref: "/resources/companies-house",
    secondaryLabel: "Companies House resources"
  },
  "directors-first-year": {
    title: "Bring director responsibilities together",
    body:
      "Bring your key company responsibilities together. BusinessSorted helps you organise upcoming obligations without relying on scattered notes and reminders.",
    primaryHref: "/register",
    primaryLabel: "Start setup",
    secondaryHref: "/pricing",
    secondaryLabel: "View pricing"
  },
  "first-year-company": {
    title: "Keep the first company year organised",
    body:
      "Your first company year includes several important dates. BusinessSorted helps you keep them organised in one place.",
    primaryHref: "/register",
    primaryLabel: "Start setup",
    secondaryHref: "/resources/companies-house",
    secondaryLabel: "Companies House resources"
  },
  "deadline-dashboard": {
    title: "Turn important dates into practical tasks",
    body:
      "BusinessSorted helps UK business owners organise Companies House, HMRC and business admin tasks without claiming to replace official guidance or professional advice.",
    primaryHref: "/register",
    primaryLabel: "Start setup",
    secondaryHref: "/resources",
    secondaryLabel: "Browse resources"
  }
} as const;

const resourceCategorySchema = z.enum(["companies-house"] satisfies [ResourceCategory]);
const resourceGroupSchema = z.enum([
  "confirmation-statements",
  "company-accounts",
  "company-information",
  "authentication-access",
  "dormant-companies",
  "directors-first-year"
] satisfies [ResourceGroup, ResourceGroup, ResourceGroup, ResourceGroup, ResourceGroup, ResourceGroup]);
const ctaVariantSchema = z.enum([
  "companies-house-obligations",
  "confirmation-statements",
  "company-accounts",
  "company-information",
  "directors-first-year",
  "first-year-company",
  "deadline-dashboard"
] satisfies [
  keyof typeof resourceCtaVariants,
  keyof typeof resourceCtaVariants,
  keyof typeof resourceCtaVariants,
  keyof typeof resourceCtaVariants,
  keyof typeof resourceCtaVariants,
  keyof typeof resourceCtaVariants,
  keyof typeof resourceCtaVariants
]);

const sourceSchema = z.object({
  label: z.string().min(2),
  href: z.string().url(),
  publisher: z.string().min(2)
});

const faqSchema = z.object({
  question: z.string().min(10),
  answer: z.string().min(40)
});

const articleSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  heading: z.string().min(6),
  body: z.array(z.string().min(40)).min(1),
  subsections: z
    .array(
      z.object({
        heading: z.string().min(6),
        body: z.array(z.string().min(40)).min(1)
      })
    )
    .optional()
});

const resourceArticleSchema = z.object({
  title: z.string().min(10),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(80).max(170),
  category: resourceCategorySchema,
  cluster: resourceGroupSchema,
  searchIntent: z.string().min(20),
  primaryKeyword: z.string().min(3),
  secondaryKeywords: z.array(z.string().min(3)).min(2),
  targetAudience: z.string().min(20),
  summary: z.string().min(80),
  directAnswer: z.string().min(80),
  supportingQuestions: z.array(z.string().min(10)).min(2),
  uniqueAngle: z.string().min(30),
  content: z.array(articleSectionSchema).min(3),
  keyFacts: z.array(z.string().min(30)).min(3),
  faqs: z.array(faqSchema).min(1),
  relatedArticleSlugs: z.array(z.string().regex(/^[a-z0-9-]+$/)),
  relatedProductFeature: z.string().min(10),
  ctaVariant: ctaVariantSchema,
  officialSources: z.array(sourceSchema).min(1),
  sourceCheckedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  lastReviewedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  author: z.string().min(3),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  estimatedReadingTime: z.number().int().positive(),
  canonicalUrl: z.string().url(),
  robots: z.enum(["index", "noindex"]),
  socialTitle: z.string().min(10).max(70),
  socialDescription: z.string().min(80).max(200),
  internalLinks: z.array(
    z.object({
      label: z.string().min(3),
      href: z.string().startsWith("/")
    })
  )
});

export type ResourceArticle = z.infer<typeof resourceArticleSchema>;
export type ResourceGuide = ResourceArticle;
export type ResourceValidationIssue = {
  slug?: string;
  field?: string;
  message: string;
};

const sources = {
  confirmationStatementGuidance: {
    label: "Filing your company's confirmation statement",
    href: "https://www.gov.uk/guidance/filing-your-companys-confirmation-statement",
    publisher: "Companies House"
  },
  confirmationStatementService: {
    label: "File a confirmation statement",
    href: "https://find-and-update.company-information.service.gov.uk/confirmation-statement",
    publisher: "Companies House"
  },
  confirmationStatementForm: {
    label: "Confirmation statement (CS01)",
    href: "https://www.gov.uk/government/publications/confirmation-statement-form-cs01-new-version",
    publisher: "Companies House"
  },
  companiesHouseFinancialPenalties: {
    label: "Companies House approach to financial penalties",
    href: "https://www.gov.uk/government/publications/companies-house-approach-to-financial-penalties/companies-house-approach-to-financial-penalties",
    publisher: "Companies House"
  },
  accountsAndTaxReturns: {
    label: "Accounts and tax returns for private limited companies",
    href: "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company/overview",
    publisher: "GOV.UK"
  },
  annualAccounts: {
    label: "Prepare annual accounts for a private limited company",
    href: "https://www.gov.uk/annual-accounts",
    publisher: "GOV.UK"
  },
  accountsGuidance: {
    label: "Preparing and filing Companies House accounts",
    href: "https://www.gov.uk/government/publications/life-of-a-company-annual-requirements/life-of-a-company-part-1-accounts",
    publisher: "Companies House"
  },
  lateFilingPenalties: {
    label: "Late filing penalties from Companies House",
    href: "https://www.gov.uk/government/publications/late-filing-penalties-from-companies-house",
    publisher: "Companies House"
  },
  payPenalty: {
    label: "Pay a penalty to Companies House",
    href: "https://www.gov.uk/pay-penalty-companies-house",
    publisher: "GOV.UK"
  },
  dormantCompany: {
    label: "Dormant companies and associations",
    href: "https://www.gov.uk/dormant-company/overview",
    publisher: "GOV.UK"
  },
  dormantForCompaniesHouse: {
    label: "Dormant for Companies House",
    href: "https://www.gov.uk/dormant-company/dormant-for-companies-house",
    publisher: "GOV.UK"
  },
  directorsResponsibilities: {
    label: "Running a limited company: directors' responsibilities",
    href: "https://www.gov.uk/running-a-limited-company",
    publisher: "GOV.UK"
  },
  beingDirector: {
    label: "Being a company director",
    href: "https://www.gov.uk/guidance/being-a-company-director",
    publisher: "Companies House"
  },
  companyRecords: {
    label: "Company and accounting records",
    href: "https://www.gov.uk/running-a-limited-company/company-and-accounting-records",
    publisher: "GOV.UK"
  },
  companyChanges: {
    label: "Tell Companies House about changes to your limited company",
    href: "https://www.gov.uk/file-changes-to-a-company-with-companies-house",
    publisher: "GOV.UK"
  },
  companyInformationReport: {
    label: "Company information you must report",
    href: "https://www.gov.uk/running-a-limited-company/company-changes-you-must-report",
    publisher: "GOV.UK"
  },
  registeredOffice: {
    label: "Change a company's registered office address (AD01)",
    href: "https://www.gov.uk/government/publications/change-a-registered-office-address-ad01",
    publisher: "Companies House"
  },
  directorDetails: {
    label: "Change director details on your limited company",
    href: "https://www.gov.uk/government/collections/change-director-details-on-your-limited-company",
    publisher: "Companies House"
  },
  directorDetailsForm: {
    label: "Change the details of a director (CH01)",
    href: "https://www.gov.uk/government/publications/change-the-details-of-a-director-ch01",
    publisher: "Companies House"
  },
  authenticationCode: {
    label: "Company authentication codes for online filing",
    href: "https://www.gov.uk/guidance/company-authentication-codes-for-online-filing",
    publisher: "Companies House"
  },
  authenticationCodeHomeAddress: {
    label: "Request an authentication code to be sent to a home address",
    href: "https://find-and-update.company-information.service.gov.uk/auth-code-requests/start",
    publisher: "Companies House"
  },
  onlineFiling: {
    label: "Filing your Companies House information online",
    href: "https://www.gov.uk/guidance/filing-your-companies-house-information-online",
    publisher: "Companies House"
  }
} as const;

export const resourceArticles = [
  {
    title: "What is a confirmation statement?",
    slug: "confirmation-statement-guide",
    description:
      "Understand what a Companies House confirmation statement is, what information it confirms and why UK limited companies still file it when nothing changes.",
    category: "companies-house",
    cluster: "confirmation-statements",
    searchIntent:
      "A UK limited company director wants a plain-English explanation of what a confirmation statement is before filing or checking a reminder.",
    primaryKeyword: "what is a confirmation statement",
    secondaryKeywords: [
      "Companies House confirmation statement",
      "confirmation statement meaning",
      "CS01 confirmation statement"
    ],
    targetAudience:
      "UK limited-company directors and small-business owners responsible for understanding Companies House filings.",
    summary:
      "A confirmation statement is the Companies House filing that confirms key company register information is correct or has been updated.",
    directAnswer:
      "A confirmation statement is a Companies House filing used to confirm that important information about a limited company is up to date. It is separate from annual accounts and Corporation Tax, and it can still be required even if nothing changed during the review period.",
    supportingQuestions: [
      "What information does a confirmation statement confirm?",
      "Is a confirmation statement the same as annual accounts?",
      "Do dormant or non-trading companies still file one?"
    ],
    uniqueAngle:
      "Defines the filing and separates it from deadline and filing-process questions covered by related guides.",
    content: [
      {
        id: "what-it-confirms",
        heading: "What the confirmation statement confirms",
        body: [
          "The confirmation statement confirms that the information Companies House holds about the company is correct or has been updated. It can cover company officers, people with significant control, shareholder information, SIC code and other register details.",
          "Companies House guidance says every company, including dormant and non-trading companies, must file at least one confirmation statement every year. The filing also includes a statement that the intended future activities of the company are lawful."
        ],
        subsections: [
          {
            heading: "What it does not do",
            body: [
              "A confirmation statement is not annual accounts and it is not a Company Tax Return. It does not report company profit or calculate tax."
            ]
          }
        ]
      },
      {
        id: "why-it-matters",
        heading: "Why directors should treat it as a separate task",
        body: [
          "Directors often group Companies House tasks together, but the confirmation statement has its own review period and filing window. Filing accounts does not file the confirmation statement.",
          "If nothing changed, the filing still matters because it confirms the register position. If something is wrong, some updates must be made before the confirmation statement is sent."
        ]
      },
      {
        id: "simple-example",
        heading: "Simple example",
        body: [
          "A company has the same directors, shareholders and registered office as last year. The director still checks the company register and files a confirmation statement to confirm the information is correct.",
          "If the registered office or director details are wrong, the director should use the correct Companies House process to update them instead of assuming the confirmation statement alone fixes every record."
        ]
      }
    ],
    keyFacts: [
      "A confirmation statement confirms key company register information with Companies House.",
      "It is separate from annual accounts, Corporation Tax and the Company Tax Return.",
      "Companies House says dormant and non-trading companies must still file confirmation statements.",
      "Some company changes must be made before the statement is filed."
    ],
    faqs: [
      {
        question: "Is a confirmation statement the same as an annual return?",
        answer:
          "The confirmation statement replaced the annual return. Companies House still describes it as the filing used to confirm that company details are up to date."
      },
      {
        question: "Do I file a confirmation statement if nothing has changed?",
        answer:
          "Usually yes. Companies House says you must file even if there have not been changes during the review period."
      }
    ],
    relatedArticleSlugs: [
      "confirmation-statement-due",
      "file-confirmation-statement",
      "late-confirmation-statement"
    ],
    relatedProductFeature: "Confirmation statement task tracking",
    ctaVariant: "confirmation-statements",
    officialSources: [
      sources.confirmationStatementGuidance,
      sources.confirmationStatementForm
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: true,
    estimatedReadingTime: 5,
    canonicalUrl: absoluteUrl("/resources/confirmation-statement-guide"),
    robots: "index",
    socialTitle: "What is a confirmation statement?",
    socialDescription:
      "Plain-English explanation of the Companies House confirmation statement, what it confirms and how it differs from accounts and tax returns.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "When your confirmation statement is due", href: "/resources/confirmation-statement-due" },
      { label: "How to file a confirmation statement", href: "/resources/file-confirmation-statement" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "When is my confirmation statement due?",
    slug: "confirmation-statement-due",
    description:
      "Find out how the Companies House confirmation statement review period works and where UK directors can check the exact filing deadline.",
    category: "companies-house",
    cluster: "confirmation-statements",
    searchIntent:
      "A director wants to understand when the confirmation statement is due and how to check the exact Companies House date.",
    primaryKeyword: "confirmation statement due date",
    secondaryKeywords: [
      "when is my confirmation statement due",
      "confirmation statement deadline",
      "Companies House review period"
    ],
    targetAudience:
      "UK limited-company directors checking a confirmation statement reminder or planning an annual filing.",
    summary:
      "A company must normally review its records and file at least one confirmation statement every 12 months, with a filing window after the review period ends.",
    directAnswer:
      "Your confirmation statement is tied to the company review period. Companies House says the review period normally ends 12 months after incorporation for the first statement, or 12 months after the confirmation statement date on the previous statement. You can usually file up to 14 days after the review period ends.",
    supportingQuestions: [
      "What is a confirmation statement review period?",
      "Can I file the confirmation statement early?",
      "Where can I check my exact filing deadline?"
    ],
    uniqueAngle:
      "Focuses on timing and date-checking rather than explaining the form or filing process.",
    content: [
      {
        id: "review-period",
        heading: "How the review period works",
        body: [
          "The review period is the period Companies House uses for the confirmation statement. For a first confirmation statement, it normally ends 12 months after incorporation. For later statements, it normally ends 12 months after the confirmation statement date on the previous statement.",
          "Companies House says the statement can usually be filed up to 14 days after the review period has ended. The practical deadline should still be checked on the company information register."
        ]
      },
      {
        id: "checking-the-date",
        heading: "Where to check the exact date",
        body: [
          "Use the Companies House register to check the company’s confirmation date and filing deadline. The register is the safer place to check because early filings and company history can change the next review period.",
          "You can also sign up for Companies House email reminders. BusinessSorted can help keep the task visible, but the official register remains the source to check before filing."
        ]
      },
      {
        id: "filing-early",
        heading: "What happens if you file early",
        body: [
          "Companies House guidance says you do not have to wait until the current review period has ended before filing. If you file early, you choose a new confirmation statement date and the next review period starts after that date.",
          "That can be useful when directors want to tidy filings early, but it also means the future date may move. Record the new date after filing rather than relying on the old reminder."
        ]
      }
    ],
    keyFacts: [
      "The first review period normally ends 12 months after incorporation.",
      "Later review periods normally run from the previous confirmation statement date.",
      "Companies House says you can usually file up to 14 days after the review period ends.",
      "Early filing can create a new confirmation statement date."
    ],
    faqs: [
      {
        question: "Is the confirmation date the same as the filing deadline?",
        answer:
          "Not exactly. The confirmation date relates to the review period, while Companies House also shows a filing deadline for sending the statement."
      },
      {
        question: "Can BusinessSorted tell me the official due date?",
        answer:
          "BusinessSorted can help you organise the task, but you should check the exact official date on the Companies House register before acting."
      }
    ],
    relatedArticleSlugs: [
      "confirmation-statement-guide",
      "file-confirmation-statement",
      "late-confirmation-statement"
    ],
    relatedProductFeature: "Confirmation statement deadline reminders",
    ctaVariant: "confirmation-statements",
    officialSources: [
      sources.confirmationStatementGuidance,
      sources.confirmationStatementService
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: true,
    estimatedReadingTime: 5,
    canonicalUrl: absoluteUrl("/resources/confirmation-statement-due"),
    robots: "index",
    socialTitle: "When is my confirmation statement due?",
    socialDescription:
      "Understand the confirmation statement review period, filing window and where to check your exact Companies House deadline.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "What a confirmation statement is", href: "/resources/confirmation-statement-guide" },
      { label: "How to file your confirmation statement", href: "/resources/file-confirmation-statement" },
      { label: "What happens if it is late", href: "/resources/late-confirmation-statement" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "How to file a confirmation statement",
    slug: "file-confirmation-statement",
    description:
      "Learn the usual steps for filing a Companies House confirmation statement and what UK directors should check before they submit it.",
    category: "companies-house",
    cluster: "confirmation-statements",
    searchIntent:
      "A director understands the filing is due and wants a practical overview of the filing route and preparation steps.",
    primaryKeyword: "how to file a confirmation statement",
    secondaryKeywords: [
      "file confirmation statement online",
      "Companies House CS01",
      "confirmation statement filing steps"
    ],
    targetAudience:
      "UK limited-company directors preparing to file a confirmation statement with Companies House.",
    summary:
      "You can file a confirmation statement online or by paper form, but you should check and update the company record before confirming it is correct.",
    directAnswer:
      "To file a confirmation statement, check the company record, update details that need separate filings, then use the appropriate Companies House online service or paper CS01 route. You normally need company access details, the company number and the company authentication code.",
    supportingQuestions: [
      "What should I check before filing?",
      "Can the confirmation statement change every company detail?",
      "What access details do I need?"
    ],
    uniqueAngle:
      "Covers filing preparation and routes, not the definition or deadline calculation.",
    content: [
      {
        id: "before-filing",
        heading: "Before you file",
        body: [
          "Companies House guidance says you should check your company details before filing. If information is incorrect or out of date, some records must be updated before the confirmation statement is sent.",
          "Changes to directors, secretaries and PSC information are examples of updates that may need to be made before confirming the record. The confirmation statement can handle some information, such as SIC code or shareholder information, but not every change."
        ]
      },
      {
        id: "filing-routes",
        heading: "Filing routes",
        body: [
          "Companies House provides online filing and paper CS01 routes. The online confirmation statement service applies only to certain private companies, and other companies may need to use WebFiling or the paper form.",
          "The service page says directors may need a Companies House account, company number, company authentication code and payment for the annual fee. Check the service before starting because eligibility and fees can change."
        ]
      },
      {
        id: "after-filing",
        heading: "After you file",
        body: [
          "Keep the filing receipt or confirmation and update your records with the new confirmation statement date. If you filed early, the next review period may have changed.",
          "If the filing fails or you realise something was wrong, use official Companies House guidance or contact Companies House rather than trying to fix the issue through unrelated filings."
        ]
      }
    ],
    keyFacts: [
      "Check the company record before filing the confirmation statement.",
      "Some updates must be filed separately before the statement is sent.",
      "Online filing usually needs company access details and the authentication code.",
      "The CS01 paper route exists, but online filing is usually quicker where available."
    ],
    faqs: [
      {
        question: "Can I change the registered office on the confirmation statement?",
        answer:
          "No. Companies House guidance says some changes, such as registered office changes, must use a separate process."
      },
      {
        question: "Does BusinessSorted file the confirmation statement?",
        answer:
          "No. BusinessSorted helps you organise the obligation and related date; it does not file documents with Companies House."
      }
    ],
    relatedArticleSlugs: [
      "confirmation-statement-guide",
      "confirmation-statement-due",
      "late-confirmation-statement"
    ],
    relatedProductFeature: "Confirmation statement preparation tasks",
    ctaVariant: "confirmation-statements",
    officialSources: [
      sources.confirmationStatementGuidance,
      sources.confirmationStatementService,
      sources.confirmationStatementForm
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 6,
    canonicalUrl: absoluteUrl("/resources/file-confirmation-statement"),
    robots: "index",
    socialTitle: "How to file a confirmation statement",
    socialDescription:
      "Practical source-linked guide to filing a Companies House confirmation statement and checking company information before submission.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "What a confirmation statement is", href: "/resources/confirmation-statement-guide" },
      { label: "When your confirmation statement is due", href: "/resources/confirmation-statement-due" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "What happens if a confirmation statement is late?",
    slug: "late-confirmation-statement",
    description:
      "Understand the possible Companies House consequences of a late confirmation statement and the practical next steps for directors.",
    category: "companies-house",
    cluster: "confirmation-statements",
    searchIntent:
      "A director has missed or may miss the confirmation statement deadline and wants to know the likely consequences and next action.",
    primaryKeyword: "late confirmation statement",
    secondaryKeywords: [
      "confirmation statement late penalty",
      "missed confirmation statement",
      "Companies House confirmation statement overdue"
    ],
    targetAudience:
      "UK limited-company directors dealing with an overdue or nearly overdue confirmation statement.",
    summary:
      "A late confirmation statement can lead to Companies House enforcement, including a possible financial penalty and strike-off action.",
    directAnswer:
      "If a confirmation statement is late, file it as soon as possible and check any Companies House letters or notices. Official guidance says Companies House may issue a financial penalty and the company may be struck off if the statement is not filed.",
    supportingQuestions: [
      "Can Companies House issue a penalty for a late confirmation statement?",
      "What should I do first if the statement is overdue?",
      "Is a late confirmation statement the same as late accounts?"
    ],
    uniqueAngle:
      "Focuses on late confirmation statement consequences rather than accounts penalty bands.",
    content: [
      {
        id: "possible-consequences",
        heading: "Possible consequences",
        body: [
          "Companies House guidance says it may issue a financial penalty and the company may be struck off the register if the confirmation statement is not filed. The guidance also warns that directors can be fined up to GBP 5,000 if they do not file.",
          "This is separate from late accounts penalties. If both accounts and the confirmation statement are overdue, treat them as separate tasks and check each official record."
        ]
      },
      {
        id: "next-steps",
        heading: "Practical next steps",
        body: [
          "Check the company register, open any Companies House letters or online messages, and file the statement if you can. If the company record is wrong, update the relevant details through the correct process before confirming the statement.",
          "If you receive a penalty warning or penalty notice, read the notice carefully. Companies House financial penalty guidance explains warning notices, representations and what may happen if a penalty is not paid."
        ]
      },
      {
        id: "avoid-repeat-problems",
        heading: "Avoid repeat problems",
        body: [
          "After resolving the overdue filing, record the new confirmation statement date and next filing deadline. If filing was delayed because the authentication code or access was missing, request or organise access well before the next deadline.",
          "Set preparation reminders before the due date, not only on the final filing day. That gives time to correct company details before filing."
        ]
      }
    ],
    keyFacts: [
      "Companies House may issue a financial penalty if a confirmation statement is not filed.",
      "The company may be struck off if the filing remains outstanding.",
      "Late confirmation statement consequences are separate from late accounts penalty bands.",
      "The safest practical step is to check the register and deal with the outstanding filing promptly."
    ],
    faqs: [
      {
        question: "Will a late confirmation statement always create the same penalty?",
        answer:
          "Do not assume that. Check any Companies House notice and current official guidance because the process depends on the notice and circumstances."
      },
      {
        question: "Can I ignore the confirmation statement if the company is dormant?",
        answer:
          "No. Companies House says dormant and non-trading companies must still file a confirmation statement."
      }
    ],
    relatedArticleSlugs: [
      "confirmation-statement-due",
      "file-confirmation-statement",
      "confirmation-statement-guide"
    ],
    relatedProductFeature: "Overdue Companies House task visibility",
    ctaVariant: "confirmation-statements",
    officialSources: [
      sources.confirmationStatementGuidance,
      sources.companiesHouseFinancialPenalties,
      sources.lateFilingPenalties
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 6,
    canonicalUrl: absoluteUrl("/resources/late-confirmation-statement"),
    robots: "index",
    socialTitle: "What happens if a confirmation statement is late?",
    socialDescription:
      "Source-linked guide to late confirmation statement consequences, Companies House notices and practical next steps for directors.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "When your confirmation statement is due", href: "/resources/confirmation-statement-due" },
      { label: "How to file a confirmation statement", href: "/resources/file-confirmation-statement" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "Annual accounts guide for UK limited company directors",
    slug: "annual-accounts-guide",
    description:
      "Understand what annual accounts are, common Companies House filing deadlines and how accounts differ from HMRC Company Tax Returns.",
    category: "companies-house",
    cluster: "company-accounts",
    searchIntent:
      "A UK limited company director wants to understand annual accounts, Companies House deadlines and how accounts relate to tax returns.",
    primaryKeyword: "annual accounts guide",
    secondaryKeywords: [
      "Companies House accounts deadline",
      "limited company annual accounts",
      "company accounts due date"
    ],
    targetAudience:
      "First-time UK limited company directors preparing for company accounts and related filing tasks.",
    summary:
      "Annual accounts are statutory accounts prepared from company financial records. Private limited companies usually file accounts with Companies House after the financial year, while HMRC Company Tax Returns follow their own deadline.",
    directAnswer:
      "Annual accounts are statutory accounts prepared from the company’s financial records. For private limited companies, later annual accounts are usually due 9 months after the company financial year ends, while first accounts have special timing rules.",
    supportingQuestions: [
      "When are annual accounts normally due?",
      "How are annual accounts different from a Company Tax Return?",
      "Where do I check the official accounts deadline?"
    ],
    uniqueAngle:
      "Acts as the foundational accounts guide and points readers to separate first-accounts, late-accounts and accounting-reference-date pages.",
    content: [
      {
        id: "what-annual-accounts-are",
        heading: "What annual accounts are",
        body: [
          "Annual accounts are statutory accounts prepared from the company financial records at the end of the financial year. GOV.UK explains that statutory accounts include financial statements such as a balance sheet and, depending on the company, other statements or reports.",
          "Accounts are not the same as a Company Tax Return. The same records may support both, but Companies House and HMRC have different filing requirements and deadlines."
        ]
      },
      {
        id: "normal-deadline",
        heading: "Normal Companies House deadline",
        body: [
          "For private limited companies, GOV.UK says later annual accounts are usually due 9 months after the company financial year ends. Public company deadlines are different, so directors should check the official guidance for their company type.",
          "The company’s accounting reference date is the financial year-end used for Companies House accounts. The Companies House register shows the filing deadline for a specific company."
        ]
      },
      {
        id: "records-to-prepare",
        heading: "Records to prepare before accounts",
        body: [
          "Directors should keep records that explain company income, costs, assets, liabilities, bank activity and decisions. Good records make accounts preparation easier and reduce last-minute work.",
          "If the company is small, a micro-entity or dormant, simpler accounts may be available. That does not mean the filing can be ignored, so check the current Companies House route before the deadline."
        ]
      }
    ],
    keyFacts: [
      "Annual accounts are statutory accounts prepared from company financial records.",
      "Later private limited company accounts are usually due 9 months after the company financial year ends.",
      "First company accounts have special timing rules and should be checked separately.",
      "Companies House accounts and HMRC Company Tax Returns are related but separate filing tasks."
    ],
    faqs: [
      {
        question: "Are annual accounts the same as a Company Tax Return?",
        answer:
          "No. Accounts and Company Tax Returns use related financial information, but Companies House and HMRC have separate filing requirements and deadlines."
      },
      {
        question: "Does a dormant company still need to think about accounts?",
        answer:
          "Yes. Dormant companies can still have Companies House filing duties. Check the official guidance for the company position before assuming no filing is needed."
      }
    ],
    relatedArticleSlugs: [
      "companies-house-deadlines",
      "first-company-accounts-deadline",
      "accounting-reference-date",
      "companies-house-late-filing-penalties"
    ],
    relatedProductFeature: "Company accounts preparation reminders",
    ctaVariant: "company-accounts",
    officialSources: [
      sources.accountsAndTaxReturns,
      sources.annualAccounts,
      sources.accountsGuidance
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: true,
    estimatedReadingTime: 6,
    canonicalUrl: absoluteUrl("/resources/annual-accounts-guide"),
    robots: "index",
    socialTitle: "Annual accounts guide for UK company directors",
    socialDescription:
      "Plain-English annual accounts guidance for UK limited company directors, with Companies House deadlines and official source links.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Companies House deadlines", href: "/resources/companies-house-deadlines" },
      { label: "First accounts deadline", href: "/resources/first-company-accounts-deadline" },
      { label: "Accounting reference date guide", href: "/resources/accounting-reference-date" },
      { label: "Late filing penalties", href: "/resources/companies-house-late-filing-penalties" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "Companies House deadlines explained",
    slug: "companies-house-deadlines",
    description:
      "A plain-English overview of the main Companies House deadlines UK limited-company directors should track and how they differ from HMRC dates.",
    category: "companies-house",
    cluster: "company-accounts",
    searchIntent:
      "A director wants a single overview of recurring Companies House dates before reading detailed accounts or confirmation statement guides.",
    primaryKeyword: "Companies House deadlines",
    secondaryKeywords: [
      "limited company filing deadlines",
      "Companies House accounts deadline",
      "confirmation statement deadline"
    ],
    targetAudience:
      "UK limited-company directors who need to separate Companies House dates from tax and other business reminders.",
    summary:
      "The main Companies House dates most directors track are confirmation statement dates and accounts filing dates, with special rules for first accounts.",
    directAnswer:
      "Companies House deadlines are the dates for filing company information with the registrar, especially confirmation statements and accounts. They are separate from HMRC tax dates, even when the same records help with both.",
    supportingQuestions: [
      "Which Companies House deadlines should directors track?",
      "How are Companies House dates different from HMRC dates?",
      "Where can I check the official filing date?"
    ],
    uniqueAngle:
      "A cluster overview that directs readers to the right detailed guide instead of repeating every deadline rule.",
    content: [
      {
        id: "core-deadlines",
        heading: "Core Companies House deadlines",
        body: [
          "Most UK limited companies need to track confirmation statements and annual accounts. A confirmation statement confirms key register information, while accounts report financial information for a company period.",
          "First accounts can have a different filing rule from later annual accounts. Directors should avoid copying a generic date without checking the company record."
        ]
      },
      {
        id: "separate-from-hmrc",
        heading: "Separate from HMRC deadlines",
        body: [
          "Companies House deadlines are not the same as Corporation Tax payment dates or Company Tax Return deadlines. GOV.UK lists these as related but separate actions for private limited companies.",
          "The same accounts and records can support both Companies House and HMRC work, but filing one item does not automatically complete the other."
        ]
      },
      {
        id: "where-to-check",
        heading: "Where to check official dates",
        body: [
          "Use the Companies House register to check the filing deadline for a specific company. Companies House also offers email reminders for accounts and confirmation statements.",
          "BusinessSorted can help you keep the tasks visible, but official dates should be checked against Companies House before filing."
        ]
      }
    ],
    keyFacts: [
      "Confirmation statements and annual accounts are separate Companies House tasks.",
      "First accounts can follow special timing rules.",
      "Companies House deadlines are separate from HMRC tax deadlines.",
      "The Companies House register is the official place to check company-specific filing dates."
    ],
    faqs: [
      {
        question: "Are Companies House and HMRC deadlines the same?",
        answer:
          "No. They can relate to the same company period, but Companies House and HMRC filings have separate deadlines and processes."
      },
      {
        question: "Can one filing complete every Companies House task?",
        answer:
          "No. Accounts, confirmation statements and company changes are different filings or processes."
      }
    ],
    relatedArticleSlugs: [
      "confirmation-statement-due",
      "annual-accounts-guide",
      "first-company-accounts-deadline",
      "accounting-reference-date"
    ],
    relatedProductFeature: "Companies House deadline overview",
    ctaVariant: "deadline-dashboard",
    officialSources: [
      sources.confirmationStatementGuidance,
      sources.accountsAndTaxReturns,
      sources.accountsGuidance
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: true,
    estimatedReadingTime: 6,
    canonicalUrl: absoluteUrl("/resources/companies-house-deadlines"),
    robots: "index",
    socialTitle: "Companies House deadlines explained",
    socialDescription:
      "Overview of Companies House confirmation statement and accounts deadlines, with links to detailed source-checked guides.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Confirmation statement due date", href: "/resources/confirmation-statement-due" },
      { label: "Annual accounts guide", href: "/resources/annual-accounts-guide" },
      { label: "First accounts deadline", href: "/resources/first-company-accounts-deadline" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "When are first company accounts due?",
    slug: "first-company-accounts-deadline",
    description:
      "Understand the special first accounts deadline for private limited companies and why it can differ from later annual accounts deadlines.",
    category: "companies-house",
    cluster: "company-accounts",
    searchIntent:
      "A first-year company director wants to understand the first Companies House accounts deadline and why it differs from later accounts.",
    primaryKeyword: "first company accounts deadline",
    secondaryKeywords: [
      "when are first company accounts due",
      "first accounts Companies House",
      "21 months after registration"
    ],
    targetAudience:
      "New UK limited-company directors planning their first Companies House accounts filing.",
    summary:
      "First company accounts have special timing because the first accounting period can be longer than 12 months.",
    directAnswer:
      "GOV.UK says first accounts for a private limited company are usually due 21 months after registration with Companies House. If the first accounts cover 12 months or less, normal filing periods can apply, so directors should check the company record and official guidance.",
    supportingQuestions: [
      "Why are first accounts different?",
      "What does incorporation date have to do with the deadline?",
      "Where do I check the exact first accounts date?"
    ],
    uniqueAngle:
      "Separates the first-year accounts rule from the normal annual accounts deadline.",
    content: [
      {
        id: "why-first-accounts-differ",
        heading: "Why first accounts can be different",
        body: [
          "A company’s first accounts often cover a period from incorporation to the first accounting reference date. That period can be more than 12 months because Companies House sets the accounting reference date around the anniversary month.",
          "GOV.UK explains that companies automatically get different reporting dates for the first annual accounts and the first Company Tax Return."
        ]
      },
      {
        id: "private-company-rule",
        heading: "The private company first-accounts rule",
        body: [
          "For private companies, GOV.UK’s overview says first accounts are usually due 21 months after the date of registration. Companies House accounts guidance adds detail for cases where the first accounts cover more than 12 months or 12 months or less.",
          "This is why a new director should not assume the first filing follows the usual 9-month post-year-end pattern."
        ]
      },
      {
        id: "practical-example",
        heading: "Practical example",
        body: [
          "If a company is incorporated in May, its first accounting reference date is usually the last day of the anniversary month the following year. The first accounts period may therefore cover more than a calendar year.",
          "Use the company register to check the actual filing deadline. If the accounting period has been changed, check the official Companies House guidance before relying on an old reminder."
        ]
      }
    ],
    keyFacts: [
      "First accounts can have a special filing deadline.",
      "GOV.UK says first private company accounts are usually due 21 months after registration.",
      "The first accounting period can be longer than 12 months.",
      "The Companies House register should be checked for the specific company deadline."
    ],
    faqs: [
      {
        question: "Are first accounts always due 9 months after year end?",
        answer:
          "No. First accounts can use special timing rules, so check Companies House guidance and the company register."
      },
      {
        question: "Can the first accounts period be longer than 12 months?",
        answer:
          "Yes. GOV.UK explains that first accounts often cover more than 12 months because of how the first accounting reference date is set."
      }
    ],
    relatedArticleSlugs: [
      "annual-accounts-guide",
      "accounting-reference-date",
      "first-year-companies-house-checklist",
      "companies-house-deadlines"
    ],
    relatedProductFeature: "First accounts preparation reminders",
    ctaVariant: "first-year-company",
    officialSources: [
      sources.accountsAndTaxReturns,
      sources.accountsGuidance
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 6,
    canonicalUrl: absoluteUrl("/resources/first-company-accounts-deadline"),
    robots: "index",
    socialTitle: "When are first company accounts due?",
    socialDescription:
      "Plain-English guide to the first Companies House accounts deadline for private limited companies and how to check the official date.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Annual accounts guide", href: "/resources/annual-accounts-guide" },
      { label: "Accounting reference date guide", href: "/resources/accounting-reference-date" },
      { label: "First-year Companies House checklist", href: "/resources/first-year-companies-house-checklist" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "What happens if company accounts are filed late?",
    slug: "late-company-accounts",
    description:
      "Understand the practical Companies House consequences of late company accounts and the next steps directors should consider.",
    category: "companies-house",
    cluster: "company-accounts",
    searchIntent:
      "A director has missed or may miss the accounts deadline and wants the practical consequences and immediate next actions.",
    primaryKeyword: "late company accounts",
    secondaryKeywords: [
      "company accounts filed late",
      "late accounts Companies House",
      "missed accounts deadline"
    ],
    targetAudience:
      "UK limited-company directors dealing with overdue or nearly overdue Companies House accounts.",
    summary:
      "Late company accounts can trigger automatic penalties and may create further risk if the filing remains outstanding.",
    directAnswer:
      "If company accounts are filed late, Companies House can issue an automatic late filing penalty. If accounts remain outstanding, official guidance says the company could face strike-off action and directors risk prosecution for failing to deliver documents.",
    supportingQuestions: [
      "What should I do if accounts are already late?",
      "Is this the same as a penalty-band guide?",
      "Can rejected accounts still become late?"
    ],
    uniqueAngle:
      "Focuses on consequences and immediate next steps, while the penalty bands have their own guide.",
    content: [
      {
        id: "immediate-consequences",
        heading: "Immediate consequences",
        body: [
          "Companies House says a penalty notice is issued automatically if accounts are filed after the deadline. This can happen even when the delay is short.",
          "Late accounts are separate from late confirmation statements and HMRC tax issues. Check each outstanding item separately so one resolved task does not hide another overdue obligation."
        ]
      },
      {
        id: "if-accounts-remain-outstanding",
        heading: "If accounts remain outstanding",
        body: [
          "Companies House accounts guidance says failure to deliver acceptable accounts on time is a criminal offence and the company can also face a civil penalty. If the registrar believes the company is no longer operating, it could be struck off and dissolved.",
          "Directors should treat official letters seriously and file acceptable accounts as soon as possible. If accounts are rejected after the deadline, the company may still receive a late filing penalty."
        ]
      },
      {
        id: "next-steps",
        heading: "Practical next steps",
        body: [
          "Check the filing deadline and the reason for delay, gather the accounts and filing access, and use official Companies House routes. If a penalty notice has arrived, read the payment and appeal instructions on the notice.",
          "If the issue involves missing records, accounting uncertainty or possible insolvency, get appropriate professional advice. BusinessSorted can organise reminders, but it cannot decide or file accounts for the company."
        ]
      }
    ],
    keyFacts: [
      "Companies House can issue an automatic penalty when accounts are late.",
      "Failure to deliver acceptable accounts on time is described in official guidance as a criminal offence.",
      "Rejected accounts after the deadline can still lead to a late filing penalty.",
      "Unresolved filings can create strike-off and director-risk consequences."
    ],
    faqs: [
      {
        question: "Can rejected accounts count as late?",
        answer:
          "Companies House guidance warns that if accounts are rejected after the filing deadline, the company will get an automatic late filing penalty."
      },
      {
        question: "Should I wait for a penalty notice before acting?",
        answer:
          "No. If accounts are overdue, check the company record and official guidance, then deal with the filing as soon as possible."
      }
    ],
    relatedArticleSlugs: [
      "annual-accounts-guide",
      "companies-house-late-filing-penalties",
      "first-company-accounts-deadline",
      "companies-house-deadlines"
    ],
    relatedProductFeature: "Accounts deadline visibility",
    ctaVariant: "company-accounts",
    officialSources: [
      sources.accountsGuidance,
      sources.lateFilingPenalties,
      sources.payPenalty
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 6,
    canonicalUrl: absoluteUrl("/resources/late-company-accounts"),
    robots: "index",
    socialTitle: "What happens if company accounts are filed late?",
    socialDescription:
      "Practical source-linked guide to late Companies House accounts, possible consequences and immediate next steps for directors.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Annual accounts guide", href: "/resources/annual-accounts-guide" },
      { label: "Late filing penalties", href: "/resources/companies-house-late-filing-penalties" },
      { label: "Companies House deadlines", href: "/resources/companies-house-deadlines" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "Companies House late filing penalties explained",
    slug: "companies-house-late-filing-penalties",
    description:
      "See the Companies House accounts late filing penalty bands, repeat late filing rules and official appeal routes for company accounts.",
    category: "companies-house",
    cluster: "company-accounts",
    searchIntent:
      "A director wants the specific late filing penalty bands and appeal route for Companies House accounts.",
    primaryKeyword: "Companies House late filing penalties",
    secondaryKeywords: [
      "late filing penalty Companies House",
      "accounts penalty bands",
      "appeal Companies House penalty"
    ],
    targetAudience:
      "UK company directors who have received or want to understand a Companies House accounts late filing penalty.",
    summary:
      "Companies House accounts penalties use bands based on how late the accounts are, and private and public company amounts differ.",
    directAnswer:
      "For private limited companies, GOV.UK lists late accounts penalties of GBP 150, GBP 375, GBP 750 or GBP 1,500 depending on how late the accounts are. The penalty is doubled if accounts are late 2 years in a row.",
    supportingQuestions: [
      "What are the private company penalty bands?",
      "When are penalties doubled?",
      "Can a late filing penalty be appealed?"
    ],
    uniqueAngle:
      "Explains penalty bands and appeal routes rather than broader late-accounts consequences.",
    content: [
      {
        id: "penalty-bands",
        heading: "Penalty bands for private companies",
        body: [
          "GOV.UK lists private limited company penalties by time after the deadline: up to 1 month, 1 to 3 months, 3 to 6 months, and more than 6 months. The listed amounts are GBP 150, GBP 375, GBP 750 and GBP 1,500 respectively.",
          "Public limited company penalties are different. Always check the official page and the penalty notice for the company’s exact position."
        ]
      },
      {
        id: "repeat-late-filing",
        heading: "Repeat late filing",
        body: [
          "GOV.UK says the penalty is doubled if the accounts are late 2 years in a row. This makes repeat late filing materially different from a one-off delay.",
          "Penalty amounts and processes can change, so keep the official source link with any internal checklist or reminder."
        ]
      },
      {
        id: "appeals-and-payment",
        heading: "Appeals and payment",
        body: [
          "Companies House provides an appeal route for accounts late filing penalties. GOV.UK says appeals usually need unexpected circumstances close to the deadline or an error by Companies House.",
          "Reasons such as the company being dormant, not being able to pay, relying on an accountant or these being first accounts are listed as unlikely to succeed. This guide is not advice on whether an appeal should be made."
        ]
      }
    ],
    keyFacts: [
      "Private company accounts penalties currently range from GBP 150 to GBP 1,500 depending on lateness.",
      "Public company penalties are different from private company penalties.",
      "Penalties are doubled if accounts are late 2 years in a row.",
      "Companies House provides official payment and appeal routes."
    ],
    faqs: [
      {
        question: "Does this penalty guide cover late confirmation statements?",
        answer:
          "No. This page focuses on accounts late filing penalties. Late confirmation statements follow a different enforcement route."
      },
      {
        question: "Can I appeal because the company is dormant?",
        answer:
          "GOV.UK says an appeal is not likely to be successful if the reason is that the company is dormant."
      }
    ],
    relatedArticleSlugs: [
      "late-company-accounts",
      "annual-accounts-guide",
      "first-company-accounts-deadline",
      "companies-house-deadlines"
    ],
    relatedProductFeature: "Accounts penalty risk reminders",
    ctaVariant: "company-accounts",
    officialSources: [
      sources.annualAccounts,
      sources.lateFilingPenalties,
      sources.payPenalty
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 6,
    canonicalUrl: absoluteUrl("/resources/companies-house-late-filing-penalties"),
    robots: "index",
    socialTitle: "Companies House late filing penalties explained",
    socialDescription:
      "Source-linked guide to Companies House accounts penalty bands, repeat late filing and official appeal routes.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Late accounts consequences", href: "/resources/late-company-accounts" },
      { label: "Annual accounts guide", href: "/resources/annual-accounts-guide" },
      { label: "Companies House deadlines", href: "/resources/companies-house-deadlines" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "What is a company's accounting reference date?",
    slug: "accounting-reference-date",
    description:
      "Understand what the accounting reference date means for Companies House accounts and why directors should check it before planning filings.",
    category: "companies-house",
    cluster: "company-accounts",
    searchIntent:
      "A director wants to understand the accounting reference date and how it affects the accounts filing deadline.",
    primaryKeyword: "accounting reference date",
    secondaryKeywords: [
      "company financial year end",
      "Companies House ARD",
      "accounts due date"
    ],
    targetAudience:
      "UK limited-company directors planning accounts preparation or checking Companies House records.",
    summary:
      "The accounting reference date is the company financial year-end used for Companies House accounts and filing deadlines.",
    directAnswer:
      "A company's accounting reference date is its financial year-end for Companies House accounts. Companies House guidance says a new company's first accounting reference date is normally the last day of the month in which the anniversary of incorporation falls.",
    supportingQuestions: [
      "How is the first accounting reference date set?",
      "How does it affect the accounts deadline?",
      "Can the accounting reference date be changed?"
    ],
    uniqueAngle:
      "Defines the accounting reference date before sending readers to the separate change process guide.",
    content: [
      {
        id: "what-it-means",
        heading: "What the accounting reference date means",
        body: [
          "The accounting reference date is the date the company’s accounts are made up to. In practical terms, it is the Companies House financial year-end for accounts purposes.",
          "The accounts filing deadline is calculated from this date for later annual accounts. For private companies, Companies House guidance says the normal period is 9 months after the accounting reference date."
        ]
      },
      {
        id: "how-it-is-set",
        heading: "How the first date is set",
        body: [
          "For new companies, Companies House guidance says the first accounting reference date will be the last day of the month in which the anniversary of incorporation falls. Later accounting reference dates normally fall on the same date each year.",
          "For example, if a company is incorporated in April, the first accounting reference date would normally be the last day of April in the following year."
        ]
      },
      {
        id: "why-directors-check-it",
        heading: "Why directors should check it",
        body: [
          "The accounting reference date affects accounts preparation, deadlines and internal planning. If the date has been changed, old reminders may be wrong.",
          "Check the Companies House register and keep the date with your source links. If the company wants to change it, use the separate Companies House process before the relevant filing deadline."
        ]
      }
    ],
    keyFacts: [
      "The accounting reference date is the company financial year-end for Companies House accounts.",
      "Later private company accounts are normally due 9 months after this date.",
      "A new company's first accounting reference date is usually based on the anniversary month of incorporation.",
      "Changing the accounting reference date can affect filing deadlines."
    ],
    faqs: [
      {
        question: "Is the accounting reference date the filing deadline?",
        answer:
          "No. It is the financial year-end used to calculate the accounts deadline. The filing deadline is a later date."
      },
      {
        question: "Where can I check my accounting reference date?",
        answer:
          "Check the company record on Companies House and official Companies House accounts guidance."
      }
    ],
    relatedArticleSlugs: [
      "annual-accounts-guide",
      "change-accounting-reference-date",
      "first-company-accounts-deadline",
      "companies-house-deadlines"
    ],
    relatedProductFeature: "Accounts date tracking",
    ctaVariant: "company-accounts",
    officialSources: [
      sources.accountsGuidance,
      sources.accountsAndTaxReturns
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 5,
    canonicalUrl: absoluteUrl("/resources/accounting-reference-date"),
    robots: "index",
    socialTitle: "What is a company's accounting reference date?",
    socialDescription:
      "Plain-English guide to the accounting reference date, how it is set and how it affects Companies House accounts deadlines.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Annual accounts guide", href: "/resources/annual-accounts-guide" },
      { label: "Change accounting reference date", href: "/resources/change-accounting-reference-date" },
      { label: "First accounts deadline", href: "/resources/first-company-accounts-deadline" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "Can I change my company accounting reference date?",
    slug: "change-accounting-reference-date",
    description:
      "Learn when a company can change its accounting reference date, what restrictions apply and how the change can affect filing deadlines.",
    category: "companies-house",
    cluster: "company-accounts",
    searchIntent:
      "A director wants to know whether the company can change its accounting reference date and what timing restrictions apply.",
    primaryKeyword: "change accounting reference date",
    secondaryKeywords: [
      "change company year end",
      "Companies House AA01",
      "extend accounting reference period"
    ],
    targetAudience:
      "UK limited-company directors considering a change to the company financial year-end for Companies House accounts.",
    summary:
      "A company can change its accounting reference date in some circumstances, but timing and extension restrictions matter.",
    directAnswer:
      "Companies House guidance says a company can change the current or immediately previous accounting reference date by filing online, using software or sending form AA01. The change must be made before the filing deadline for the accounts period being changed.",
    supportingQuestions: [
      "Can I change an overdue accounts period?",
      "How long can an accounting period be extended?",
      "What happens to the filing deadline after a change?"
    ],
    uniqueAngle:
      "Focuses on the change process and restrictions, not the definition of the accounting reference date.",
    content: [
      {
        id: "when-you-can-change",
        heading: "When you can change it",
        body: [
          "Companies House guidance says you can change the current or immediately previous accounting reference date. You can file the change online, use software or send paper form AA01.",
          "You must do this before the filing deadline for the accounts period you want to change. If the accounts are already overdue, Companies House says it is too late to change the accounting reference date for that period."
        ]
      },
      {
        id: "restrictions",
        heading: "Restrictions to check",
        body: [
          "There are restrictions on extending accounting periods. Companies House guidance says you cannot extend a period so that it lasts more than 18 months from the start date of the accounting period, unless an exception applies.",
          "The guidance also explains restrictions on extending more than once in 5 years. From 1 April 2028, Companies House says a business reason will be needed if a company wants to shorten the accounting reference period more than once in 5 years, subject to forthcoming regulations."
        ]
      },
      {
        id: "deadline-effect",
        heading: "How a change can affect deadlines",
        body: [
          "Changing the accounting reference date can change the accounts filing deadline. If the new deadline has already passed when the date is changed, Companies House guidance says the company will get an automatic late filing penalty.",
          "Before changing the date, check whether it helps or creates a new deadline problem. This is an area where accountant input may be useful."
        ]
      }
    ],
    keyFacts: [
      "Companies House uses form AA01 or online/software filing to change the accounting reference date.",
      "The change must be made before the accounts filing deadline for the period being changed.",
      "An accounting period usually cannot be extended beyond 18 months unless an exception applies.",
      "Changing the date can create a new filing deadline and may trigger a penalty if that deadline has already passed."
    ],
    faqs: [
      {
        question: "Can I change the accounting reference date after accounts are overdue?",
        answer:
          "Companies House guidance says if your accounts are overdue, it is too late to change the accounting reference date for that period."
      },
      {
        question: "Does changing the accounting reference date remove an accounts deadline?",
        answer:
          "No. It changes the accounting period and can change the deadline, but it can also create a penalty risk if the new deadline has passed."
      }
    ],
    relatedArticleSlugs: [
      "accounting-reference-date",
      "annual-accounts-guide",
      "first-company-accounts-deadline",
      "late-company-accounts"
    ],
    relatedProductFeature: "Accounts deadline planning",
    ctaVariant: "company-accounts",
    officialSources: [
      sources.accountsGuidance,
      sources.onlineFiling
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 6,
    canonicalUrl: absoluteUrl("/resources/change-accounting-reference-date"),
    robots: "index",
    socialTitle: "Can I change my company accounting reference date?",
    socialDescription:
      "Source-linked guide to changing a company accounting reference date, including Companies House timing and extension restrictions.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Accounting reference date guide", href: "/resources/accounting-reference-date" },
      { label: "Annual accounts guide", href: "/resources/annual-accounts-guide" },
      { label: "Late accounts consequences", href: "/resources/late-company-accounts" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "What information must a company keep up to date?",
    slug: "company-information-keep-up-to-date",
    description:
      "Understand the main company information directors must keep current with Companies House, including officers, PSCs and registered office details.",
    category: "companies-house",
    cluster: "company-information",
    searchIntent:
      "A director wants to know which company register details must be kept up to date and where to update them.",
    primaryKeyword: "company information keep up to date",
    secondaryKeywords: [
      "Companies House company changes",
      "company information to report",
      "limited company register details"
    ],
    targetAudience:
      "UK limited-company directors responsible for maintaining the company record at Companies House.",
    summary:
      "Directors must report certain company information to Companies House and keep the company record current when details change.",
    directAnswer:
      "A company must keep key Companies House information up to date, including directors and secretaries, PSC information, registered office address, accounting reference date and certain share, mortgage or company-name changes. Some updates have specific deadlines and filing routes.",
    supportingQuestions: [
      "Which company changes must be reported?",
      "Can every change wait until the confirmation statement?",
      "What should directors check regularly?"
    ],
    uniqueAngle:
      "Acts as the company-information overview and sends readers to detailed registered-office and director-detail guides.",
    content: [
      {
        id: "information-to-report",
        heading: "Information Companies House expects you to report",
        body: [
          "GOV.UK says limited companies must tell Companies House about changes including directors, company secretaries, registered office address, accounting reference date, PSC information, share structure and certain charges.",
          "Some changes may also require a resolution or HMRC notification. This guide focuses on Companies House register information, not tax advice."
        ]
      },
      {
        id: "not-all-through-confirmation-statement",
        heading: "Not every change belongs on the confirmation statement",
        body: [
          "The confirmation statement confirms information is up to date, but it cannot be used for every change. Companies House guidance says some changes must be made before sending the confirmation statement.",
          "For example, registered office changes and director detail changes have separate Companies House processes. Treat them as action items when they happen, not just annual review tasks."
        ]
      },
      {
        id: "regular-checks",
        heading: "Useful regular checks",
        body: [
          "Directors should periodically check the company register for officer details, registered office, PSCs, shareholder information and filing dates. Keeping evidence of updates can make future filings easier.",
          "If multiple people help with company admin, agree who owns each update and keep Companies House access details secure."
        ]
      }
    ],
    keyFacts: [
      "Companies House must be told about certain limited company changes.",
      "Director and secretary changes must be reported within official time limits.",
      "Some changes must be made separately before a confirmation statement is filed.",
      "The company register should be checked when responsibilities change or before annual filings."
    ],
    faqs: [
      {
        question: "Can I wait until the confirmation statement to update every change?",
        answer:
          "No. Companies House guidance says some changes must be reported separately and some before the confirmation statement is sent."
      },
      {
        question: "Does BusinessSorted update Companies House for me?",
        answer:
          "No. BusinessSorted helps organise responsibilities and tasks; it does not submit updates to Companies House."
      }
    ],
    relatedArticleSlugs: [
      "change-registered-office-address",
      "change-company-director-details",
      "confirmation-statement-guide",
      "file-confirmation-statement"
    ],
    relatedProductFeature: "Company information update task tracking",
    ctaVariant: "company-information",
    officialSources: [
      sources.companyChanges,
      sources.companyInformationReport,
      sources.confirmationStatementGuidance
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 6,
    canonicalUrl: absoluteUrl("/resources/company-information-keep-up-to-date"),
    robots: "index",
    socialTitle: "What information must a company keep up to date?",
    socialDescription:
      "Source-linked overview of Companies House information directors must keep current, including officers, PSCs and registered office details.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Change registered office address", href: "/resources/change-registered-office-address" },
      { label: "Change director details", href: "/resources/change-company-director-details" },
      { label: "How to file a confirmation statement", href: "/resources/file-confirmation-statement" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "How to change a company's registered office address",
    slug: "change-registered-office-address",
    description:
      "Learn when and how to tell Companies House about a change to a limited company's registered office address.",
    category: "companies-house",
    cluster: "company-information",
    searchIntent:
      "A director needs to update the registered office and wants the official timing and filing route.",
    primaryKeyword: "change registered office address",
    secondaryKeywords: [
      "Companies House AD01",
      "change company address",
      "registered office address Companies House"
    ],
    targetAudience:
      "UK limited-company directors or administrators changing the registered office address.",
    summary:
      "Companies House must be told when a registered office changes, and the address becomes part of the public company record.",
    directAnswer:
      "To change a company's registered office address, use the Companies House online service or form AD01 where appropriate. Companies House guidance says you must tell Companies House within 14 days of the change taking place.",
    supportingQuestions: [
      "How quickly must Companies House be told?",
      "What access details are needed?",
      "Will my home address be public if I use it?"
    ],
    uniqueAngle:
      "Focuses specifically on registered office changes, separate from broader company information updates.",
    content: [
      {
        id: "deadline-to-report",
        heading: "Deadline to report the change",
        body: [
          "Companies House guidance for form AD01 says you must tell Companies House within 14 days of the registered office address change taking place.",
          "The registered office is where official notices can be sent, so an outdated address can create practical risk if Companies House letters are missed."
        ]
      },
      {
        id: "how-to-update",
        heading: "How to update it",
        body: [
          "Companies House says you can use the online service to update the registered office address quickly. You will need the company authentication code.",
          "Paper filing may be needed for some companies, including where the company has been defaulted to the Companies House address, is in liquidation, is applying to be restored, or is an unregistered company."
        ]
      },
      {
        id: "public-address",
        heading: "Think about public address visibility",
        body: [
          "Companies House guidance says if you use your home address as the company’s registered office address, it will be available to the public.",
          "Before changing the address, consider mail handling and who can access the address. This is general information, not advice on which address your company should use."
        ]
      }
    ],
    keyFacts: [
      "Companies House says the registered office change must be reported within 14 days.",
      "The online route normally needs the company authentication code.",
      "A home address used as registered office will be publicly available.",
      "Some companies may need to use paper filing rather than the online service."
    ],
    faqs: [
      {
        question: "Can I change the registered office on the confirmation statement?",
        answer:
          "No. Use the registered office change process rather than waiting for the confirmation statement."
      },
      {
        question: "Do I need an authentication code?",
        answer:
          "Companies House guidance says you need the company authentication code for the online registered office change service."
      }
    ],
    relatedArticleSlugs: [
      "company-information-keep-up-to-date",
      "company-authentication-code",
      "get-replace-company-authentication-code",
      "file-confirmation-statement"
    ],
    relatedProductFeature: "Company change reminders",
    ctaVariant: "company-information",
    officialSources: [
      sources.registeredOffice,
      sources.companyChanges,
      sources.authenticationCode
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 5,
    canonicalUrl: absoluteUrl("/resources/change-registered-office-address"),
    robots: "index",
    socialTitle: "How to change a company's registered office address",
    socialDescription:
      "Plain-English guide to changing a company registered office address with Companies House, including the 14-day reporting rule.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Company information to keep up to date", href: "/resources/company-information-keep-up-to-date" },
      { label: "Company authentication code", href: "/resources/company-authentication-code" },
      { label: "How to get an authentication code", href: "/resources/get-replace-company-authentication-code" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "How to change company director details",
    slug: "change-company-director-details",
    description:
      "Understand which Companies House routes update director appointments, resignations and personal-detail changes for a limited company.",
    category: "companies-house",
    cluster: "company-information",
    searchIntent:
      "A director or administrator needs to update director details and wants to know which Companies House process applies.",
    primaryKeyword: "change company director details",
    secondaryKeywords: [
      "Companies House director details",
      "CH01 director details",
      "appoint resign director Companies House"
    ],
    targetAudience:
      "UK limited-company directors and administrators updating officer details at Companies House.",
    summary:
      "Director appointments, resignations and personal-detail changes are separate Companies House updates and should not be left to the confirmation statement.",
    directAnswer:
      "Use the relevant Companies House online service or form to appoint a director, terminate an appointment or change director details. GOV.UK says companies must tell Companies House within 14 days if directors or their personal details change.",
    supportingQuestions: [
      "Which forms relate to director changes?",
      "Can I use CH01 for every director change?",
      "Can director changes wait until the confirmation statement?"
    ],
    uniqueAngle:
      "Separates director-detail updates from registered office and general information updates.",
    content: [
      {
        id: "what-changes",
        heading: "What changes this covers",
        body: [
          "Companies House lists separate forms or online routes for appointing a director, appointing a corporate director, terminating an appointment and changing director details.",
          "Form CH01 is for changes to an individual director’s name or address. It is not the form for appointing or removing a director."
        ]
      },
      {
        id: "reporting-time",
        heading: "Reporting time",
        body: [
          "GOV.UK says you must tell Companies House within 14 days if there are changes to directors or their personal details. Similar timing applies to company secretary changes.",
          "Because this is a separate reporting duty, do not wait until the confirmation statement if a director appointment, resignation or detail change has already happened."
        ]
      },
      {
        id: "practical-checks",
        heading: "Practical checks before updating",
        body: [
          "Check the director’s name, service address and other required details against Companies House guidance. If identity verification details are relevant, follow the current Companies House process.",
          "Keep a record of the update and review the company register afterwards so future confirmation statements do not confirm outdated information."
        ]
      }
    ],
    keyFacts: [
      "Director appointments, resignations and detail changes use specific Companies House routes.",
      "GOV.UK says director changes or personal-detail changes must be reported within 14 days.",
      "CH01 changes an individual director’s name or address; it does not appoint or remove a director.",
      "Director changes should not be left until the annual confirmation statement."
    ],
    faqs: [
      {
        question: "Can CH01 appoint a new director?",
        answer:
          "No. Companies House lists AP01 for appointing an individual director and CH01 for changing an existing individual director’s details."
      },
      {
        question: "Can BusinessSorted change director details for me?",
        answer:
          "No. BusinessSorted helps organise the task and reminder, but the update must be made through Companies House."
      }
    ],
    relatedArticleSlugs: [
      "company-information-keep-up-to-date",
      "confirmation-statement-guide",
      "file-confirmation-statement",
      "directors-responsibilities-checklist"
    ],
    relatedProductFeature: "Director-detail update reminders",
    ctaVariant: "company-information",
    officialSources: [
      sources.directorDetails,
      sources.directorDetailsForm,
      sources.companyInformationReport
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 5,
    canonicalUrl: absoluteUrl("/resources/change-company-director-details"),
    robots: "index",
    socialTitle: "How to change company director details",
    socialDescription:
      "Source-linked guide to updating director appointments, resignations and personal details with Companies House.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Company information to keep up to date", href: "/resources/company-information-keep-up-to-date" },
      { label: "What a confirmation statement is", href: "/resources/confirmation-statement-guide" },
      { label: "Directors' responsibilities checklist", href: "/resources/directors-responsibilities-checklist" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "What is a company authentication code?",
    slug: "company-authentication-code",
    description:
      "Understand what a Companies House company authentication code is, why it matters and how directors should protect it.",
    category: "companies-house",
    cluster: "authentication-access",
    searchIntent:
      "A director wants to understand what the company authentication code is before filing online or sharing access.",
    primaryKeyword: "company authentication code",
    secondaryKeywords: [
      "Companies House authentication code",
      "WebFiling authentication code",
      "company auth code"
    ],
    targetAudience:
      "UK limited-company directors who need to file Companies House information online or manage filing access.",
    summary:
      "The company authentication code is the Companies House code used to authorise online filings for a specific company.",
    directAnswer:
      "A company authentication code is a 6-character alphanumeric code issued by Companies House to each company. Companies House says it is used to authorise information filed online and is equivalent to a company officer’s signature.",
    supportingQuestions: [
      "Is it the same as a personal code?",
      "Why should the code be protected?",
      "When might I need it?"
    ],
    uniqueAngle:
      "Defines the code and security risk, while the separate guide explains how to request or replace it.",
    content: [
      {
        id: "what-it-is",
        heading: "What the code is",
        body: [
          "Companies House says the company authentication code is issued to each company and is used to authorise online filings. It is different from a Companies House personal code used for identity verification.",
          "You may need the code for Companies House WebFiling, Find and update company information, or commercial software filing."
        ]
      },
      {
        id: "why-security-matters",
        heading: "Why security matters",
        body: [
          "Companies House guidance says the code should be treated with the same care as a bank card PIN. Anyone who knows it may be able to change company details online.",
          "Share it only with people you trust to file for the company, and change it if it is known by someone who should no longer have filing access."
        ]
      },
      {
        id: "planning-for-deadlines",
        heading: "Plan for filing deadlines",
        body: [
          "Do not wait until accounts or a confirmation statement are due before checking whether you have access. Companies House says delivery of a requested authentication code can take up to 10 working days.",
          "A missing code can turn a simple filing into a deadline risk, especially near accounts or confirmation statement dates."
        ]
      }
    ],
    keyFacts: [
      "The company authentication code is a 6-character alphanumeric code.",
      "It authorises online filings for the company.",
      "It is different from a personal code for identity verification.",
      "Companies House says it can take up to 10 working days to receive a requested code."
    ],
    faqs: [
      {
        question: "Is the company authentication code the same as a Government Gateway login?",
        answer:
          "No. Companies House guidance says you cannot use your Government Gateway account to send Companies House information online."
      },
      {
        question: "Should I email the authentication code to other people?",
        answer:
          "Be careful. Companies House says to share the code only with someone you trust to file information for your company."
      }
    ],
    relatedArticleSlugs: [
      "get-replace-company-authentication-code",
      "file-confirmation-statement",
      "change-registered-office-address",
      "companies-house-deadlines"
    ],
    relatedProductFeature: "Filing access preparation reminders",
    ctaVariant: "company-information",
    officialSources: [
      sources.authenticationCode,
      sources.onlineFiling
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 5,
    canonicalUrl: absoluteUrl("/resources/company-authentication-code"),
    robots: "index",
    socialTitle: "What is a company authentication code?",
    socialDescription:
      "Plain-English guide to the Companies House company authentication code, what it does and why directors should protect it.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "How to get or replace an authentication code", href: "/resources/get-replace-company-authentication-code" },
      { label: "How to file a confirmation statement", href: "/resources/file-confirmation-statement" },
      { label: "Change registered office address", href: "/resources/change-registered-office-address" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "How to get or replace a Companies House authentication code",
    slug: "get-replace-company-authentication-code",
    description:
      "Learn how Companies House sends company authentication codes, how long delivery can take and what to check if the code is missing.",
    category: "companies-house",
    cluster: "authentication-access",
    searchIntent:
      "A director needs to request, replace or recover access to a company authentication code before filing online.",
    primaryKeyword: "get Companies House authentication code",
    secondaryKeywords: [
      "replace company authentication code",
      "request authentication code home address",
      "Companies House code not received"
    ],
    targetAudience:
      "UK limited-company directors who need Companies House online filing access before a deadline.",
    summary:
      "Companies House sends authentication codes by post, so directors should request or replace the code well before a filing deadline.",
    directAnswer:
      "To get a company authentication code, sign in or create Companies House WebFiling access and follow the request steps. Companies House sends the code by post, normally to the registered office, and says it can take up to 10 working days to arrive.",
    supportingQuestions: [
      "Can Companies House email the code?",
      "Can the code be sent to a home address?",
      "What if the registered office is wrong?"
    ],
    uniqueAngle:
      "Focuses on requesting and recovering access, not defining what the code is.",
    content: [
      {
        id: "requesting-the-code",
        heading: "Requesting the code",
        body: [
          "Companies House guidance says you need to create an account or sign in to WebFiling and follow the steps to request the company authentication code.",
          "If the company already has a code, Companies House says it will send a reminder. The code is not sent by email or given over the phone."
        ]
      },
      {
        id: "where-it-is-sent",
        heading: "Where the code is sent",
        body: [
          "Companies House normally sends the authentication code by post to the company’s registered office. The guidance says it can take up to 10 working days to arrive.",
          "If you cannot access the registered office, Companies House provides a service to request the code to be sent to an active officer’s home address in certain circumstances."
        ]
      },
      {
        id: "if-it-does-not-arrive",
        heading: "If the code does not arrive",
        body: [
          "If the code was sent to the registered office and has not arrived, check whether the registered office address on the company register is correct. If it is wrong, you may need to correct the address before requesting the code again.",
          "If a deadline is close, check official Companies House help rather than guessing. Code delivery time is a practical reason to organise access well before accounts or confirmation statement dates."
        ]
      }
    ],
    keyFacts: [
      "Companies House sends company authentication codes by post, not email.",
      "Delivery can take up to 10 working days.",
      "The code is normally sent to the registered office.",
      "A home-address request service exists for active officers in certain circumstances."
    ],
    faqs: [
      {
        question: "Can Companies House tell me the code over the phone?",
        answer:
          "No. Companies House guidance says it cannot send the code by email or tell you the code over the phone."
      },
      {
        question: "Can I request the code on the deadline day?",
        answer:
          "You can request it, but it may not arrive in time. Companies House says delivery can take up to 10 working days."
      }
    ],
    relatedArticleSlugs: [
      "company-authentication-code",
      "file-confirmation-statement",
      "change-registered-office-address",
      "annual-accounts-guide"
    ],
    relatedProductFeature: "Filing access preparation reminders",
    ctaVariant: "company-information",
    officialSources: [
      sources.authenticationCode,
      sources.authenticationCodeHomeAddress,
      sources.onlineFiling
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 5,
    canonicalUrl: absoluteUrl("/resources/get-replace-company-authentication-code"),
    robots: "index",
    socialTitle: "How to get or replace a Companies House authentication code",
    socialDescription:
      "Source-linked guide to requesting or replacing a Companies House company authentication code before filing online.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "What the authentication code is", href: "/resources/company-authentication-code" },
      { label: "How to file a confirmation statement", href: "/resources/file-confirmation-statement" },
      { label: "Companies House deadlines", href: "/resources/companies-house-deadlines" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "Dormant company filing obligations",
    slug: "dormant-company-filing-obligations",
    description:
      "Understand which Companies House filings can still apply to dormant limited companies, including accounts and confirmation statements.",
    category: "companies-house",
    cluster: "dormant-companies",
    searchIntent:
      "A director wants to know whether a dormant company still has Companies House filing obligations and which filings may apply.",
    primaryKeyword: "dormant company filing obligations",
    secondaryKeywords: [
      "do dormant companies need to file accounts",
      "dormant company confirmation statement",
      "dormant accounts Companies House"
    ],
    targetAudience:
      "UK limited-company directors with dormant or non-trading companies.",
    summary:
      "Dormant companies can still have Companies House filing obligations, including confirmation statements and annual accounts.",
    directAnswer:
      "Yes, a dormant limited company usually still needs to file with Companies House. GOV.UK says you must file the confirmation statement and annual accounts even if the limited company is dormant for Corporation Tax or dormant according to Companies House.",
    supportingQuestions: [
      "Do dormant companies need to file accounts?",
      "Do dormant companies need confirmation statements?",
      "What counts as dormant for Companies House?"
    ],
    uniqueAngle:
      "Consolidates dormant filing obligations and dormant accounts because the user need and next action substantially overlap.",
    content: [
      {
        id: "filings-still-apply",
        heading: "Filings can still apply",
        body: [
          "GOV.UK says a limited company must file its confirmation statement and annual accounts with Companies House even if it is dormant for Corporation Tax or dormant according to Companies House.",
          "This is why a company with no trading activity can still receive Companies House reminders and late filing consequences."
        ]
      },
      {
        id: "dormant-for-companies-house",
        heading: "Dormant for Companies House",
        body: [
          "A company is dormant according to Companies House if it has had no significant transactions in the financial year. GOV.UK gives examples of transactions that are not significant for this purpose, such as filing fees paid to Companies House and money paid for shares on incorporation.",
          "If the company is dormant according to Companies House and qualifies as small, GOV.UK says it can file dormant accounts and does not have to include an auditor’s report with those accounts."
        ]
      },
      {
        id: "practical-next-steps",
        heading: "Practical next steps",
        body: [
          "Check the company register for the accounts and confirmation statement dates, then check whether the company is dormant for Companies House purposes. Do not assume HMRC dormant status automatically removes Companies House filings.",
          "If the company restarts trading, GOV.UK says you do not need to tell Companies House just because trading restarts; the next non-dormant accounts will show the change."
        ]
      }
    ],
    keyFacts: [
      "Dormant limited companies can still need to file accounts and confirmation statements.",
      "Dormant for Corporation Tax and dormant for Companies House are not identical ideas.",
      "Small dormant companies may be able to file dormant accounts.",
      "Dormant status is not a reason to ignore Companies House deadlines."
    ],
    faqs: [
      {
        question: "Do dormant companies need to file accounts?",
        answer:
          "Yes. GOV.UK says annual accounts must still be filed with Companies House even if the limited company is dormant."
      },
      {
        question: "Do dormant companies need confirmation statements?",
        answer:
          "Yes. GOV.UK says dormant and non-trading companies must file confirmation statements."
      }
    ],
    relatedArticleSlugs: [
      "annual-accounts-guide",
      "confirmation-statement-guide",
      "companies-house-deadlines",
      "companies-house-late-filing-penalties"
    ],
    relatedProductFeature: "Dormant company filing reminders",
    ctaVariant: "deadline-dashboard",
    officialSources: [
      sources.dormantCompany,
      sources.dormantForCompaniesHouse,
      sources.confirmationStatementGuidance,
      sources.annualAccounts
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 6,
    canonicalUrl: absoluteUrl("/resources/dormant-company-filing-obligations"),
    robots: "index",
    socialTitle: "Dormant company filing obligations",
    socialDescription:
      "Source-linked guide to dormant company Companies House filings, including accounts and confirmation statements.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Annual accounts guide", href: "/resources/annual-accounts-guide" },
      { label: "What a confirmation statement is", href: "/resources/confirmation-statement-guide" },
      { label: "Companies House deadlines", href: "/resources/companies-house-deadlines" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "Directors' responsibilities checklist",
    slug: "directors-responsibilities-checklist",
    description:
      "A plain-English Companies House responsibilities checklist for UK limited-company directors, with official source links.",
    category: "companies-house",
    cluster: "directors-first-year",
    searchIntent:
      "A new or existing company director wants a practical checklist of Companies House responsibilities and recurring filings.",
    primaryKeyword: "directors responsibilities checklist",
    secondaryKeywords: [
      "limited company director responsibilities",
      "Companies House director duties",
      "director filing checklist"
    ],
    targetAudience:
      "UK limited-company directors who want a practical source-linked Companies House responsibility checklist.",
    summary:
      "Directors are responsible for making sure required company information, accounts and confirmation statements are sent to Companies House on time.",
    directAnswer:
      "A director should keep company records, file accounts, file confirmation statements, report company changes and keep Companies House information current. GOV.UK says directors remain legally responsible even if they hire other people to manage some tasks day to day.",
    supportingQuestions: [
      "What Companies House tasks are directors responsible for?",
      "Can an accountant remove the director's responsibility?",
      "Which records should directors keep?"
    ],
    uniqueAngle:
      "A practical checklist page for directors, not a detailed legal duties article.",
    content: [
      {
        id: "core-checklist",
        heading: "Core Companies House checklist",
        body: [
          "Companies House guidance says directors are responsible for making sure information is sent to Companies House on time. This includes the confirmation statement, annual accounts, changes in company officers or their details, registered office changes, share allotments, charges and PSC changes.",
          "GOV.UK also says directors must keep company records and accounting records. This guide is a practical Companies House-focused checklist, not a complete legal advice note."
        ]
      },
      {
        id: "responsibility-remains",
        heading: "Responsibility remains with directors",
        body: [
          "GOV.UK says you can hire other people, such as an accountant, to manage some tasks day to day, but directors are still legally responsible for company records, accounts and performance.",
          "That means directors should keep visibility of the task list even when someone else prepares a filing."
        ]
      },
      {
        id: "working-habit",
        heading: "Useful working habit",
        body: [
          "Keep a source-linked list of recurring Companies House tasks: accounts, confirmation statement, company changes, access details and records. Review it after each filing and when directors, addresses or shareholders change.",
          "Store official source links with each task so the person acting can check current Companies House wording before filing or updating information."
        ]
      }
    ],
    keyFacts: [
      "Directors remain responsible even when others help with day-to-day administration.",
      "Companies House responsibilities include accounts, confirmation statements and certain company changes.",
      "Company and accounting records must be kept.",
      "A practical checklist should include filing dates, access details and official source links."
    ],
    faqs: [
      {
        question: "Does hiring an accountant remove director responsibility?",
        answer:
          "No. GOV.UK says directors remain legally responsible for the company’s records, accounts and performance."
      },
      {
        question: "Is this a full legal duties checklist?",
        answer:
          "No. This is a Companies House-focused educational checklist. Get professional advice if your situation needs it."
      }
    ],
    relatedArticleSlugs: [
      "companies-house-deadlines",
      "annual-accounts-guide",
      "confirmation-statement-guide",
      "company-information-keep-up-to-date",
      "first-year-companies-house-checklist"
    ],
    relatedProductFeature: "Director responsibility task list",
    ctaVariant: "directors-first-year",
    officialSources: [
      sources.directorsResponsibilities,
      sources.beingDirector,
      sources.companyRecords
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: false,
    estimatedReadingTime: 6,
    canonicalUrl: absoluteUrl("/resources/directors-responsibilities-checklist"),
    robots: "index",
    socialTitle: "Directors' responsibilities checklist",
    socialDescription:
      "Companies House-focused checklist for UK limited-company directors, covering records, accounts, statements and company changes.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Companies House deadlines", href: "/resources/companies-house-deadlines" },
      { label: "Company information to keep up to date", href: "/resources/company-information-keep-up-to-date" },
      { label: "First-year Companies House checklist", href: "/resources/first-year-companies-house-checklist" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  },
  {
    title: "First-year limited-company Companies House checklist",
    slug: "first-year-companies-house-checklist",
    description:
      "A practical first-year Companies House checklist for new UK limited-company directors, including accounts and confirmation statement planning.",
    category: "companies-house",
    cluster: "directors-first-year",
    searchIntent:
      "A new limited-company director wants a first-year Companies House checklist and the next questions to read.",
    primaryKeyword: "first-year Companies House checklist",
    secondaryKeywords: [
      "first year limited company checklist",
      "new company director Companies House",
      "first accounts confirmation statement"
    ],
    targetAudience:
      "New UK limited-company directors planning their first year of Companies House administration.",
    summary:
      "The first company year should include planning for the first accounts, confirmation statement, company records and access to Companies House filing services.",
    directAnswer:
      "In the first year, directors should save incorporation details, check the company register, organise the company authentication code, track the first accounts deadline, track the first confirmation statement review period and keep company records up to date.",
    supportingQuestions: [
      "Which Companies House dates matter in year one?",
      "What access details should a new director organise?",
      "What records should be kept from the start?"
    ],
    uniqueAngle:
      "Pulls the cluster together for first-year directors without duplicating each detailed guide.",
    content: [
      {
        id: "first-year-dates",
        heading: "First-year dates to record",
        body: [
          "Record the first accounts deadline and the first confirmation statement review period. GOV.UK says first private company accounts are usually due 21 months after registration, while the first confirmation statement review period normally ends 12 months after incorporation.",
          "These dates are not the same and can lead to different preparation tasks. Check the company register for the official company-specific dates."
        ]
      },
      {
        id: "first-year-access",
        heading: "Access to organise early",
        body: [
          "Request and store the company authentication code securely before you need to file. Companies House says delivery of the code can take up to 10 working days.",
          "Confirm who can access WebFiling or Companies House services, who receives reminders and where source links are stored."
        ]
      },
      {
        id: "records-and-changes",
        heading: "Records and changes to keep current",
        body: [
          "Keep incorporation documents, company records, shareholder information, director details and accounting records from the start. GOV.UK says directors must keep company records and accounting records.",
          "If the registered office, director details or PSC information changes, use the correct Companies House process instead of waiting for the annual confirmation statement."
        ]
      }
    ],
    keyFacts: [
      "First accounts and first confirmation statement dates are separate.",
      "The company authentication code should be organised before filing deadlines.",
      "Company and accounting records should be kept from the start.",
      "Company changes may need separate Companies House filings when they happen."
    ],
    faqs: [
      {
        question: "Is the first accounts deadline the same as the first confirmation statement date?",
        answer:
          "No. They are separate Companies House tasks with different timing rules."
      },
      {
        question: "Can BusinessSorted file first-year Companies House documents?",
        answer:
          "No. BusinessSorted helps organise the obligations and reminders; it does not file Companies House documents for you."
      }
    ],
    relatedArticleSlugs: [
      "first-company-accounts-deadline",
      "confirmation-statement-due",
      "company-authentication-code",
      "directors-responsibilities-checklist",
      "companies-house-deadlines"
    ],
    relatedProductFeature: "First-year company setup checklist",
    ctaVariant: "first-year-company",
    officialSources: [
      sources.accountsAndTaxReturns,
      sources.confirmationStatementGuidance,
      sources.authenticationCode,
      sources.companyRecords
    ],
    sourceCheckedDate: checkedDate,
    lastReviewedDate: checkedDate,
    author: "Business Sorted editorial team",
    status: "published",
    featured: true,
    estimatedReadingTime: 6,
    canonicalUrl: absoluteUrl("/resources/first-year-companies-house-checklist"),
    robots: "index",
    socialTitle: "First-year limited-company Companies House checklist",
    socialDescription:
      "Source-linked first-year Companies House checklist for UK limited-company directors, covering accounts, statements, access and records.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "First accounts deadline", href: "/resources/first-company-accounts-deadline" },
      { label: "Confirmation statement due date", href: "/resources/confirmation-statement-due" },
      { label: "Company authentication code", href: "/resources/company-authentication-code" },
      { label: "Start BusinessSorted setup", href: "/register" }
    ]
  }
] as const satisfies readonly ResourceArticle[];

resourceArticles.forEach((article) => resourceArticleSchema.parse(article));

export const resourceArticleMap: ReadonlyMap<string, ResourceArticle> = new Map(
  resourceArticles.map((article) => [article.slug, article])
);

export const resourceGuideMap = resourceArticleMap;

export function resourcePath(slug: string) {
  return `/resources/${slug}`;
}

export function resourceUrl(slug: string) {
  return absoluteUrl(resourcePath(slug));
}

export function resourceCategoryPath(category: ResourceCategory) {
  return `/resources/${category}`;
}

export function getResourceArticle(slug: string) {
  return resourceArticleMap.get(slug);
}

export const getGuide = getResourceArticle;

export function getPublishedResourceArticles() {
  return resourceArticles.filter((article) => article.status === "published");
}

export function getIndexableResourceArticles() {
  return getPublishedResourceArticles().filter((article) => article.robots === "index");
}

export function getFeaturedResourceArticles() {
  return getIndexableResourceArticles().filter((article) => article.featured);
}

export function getResourceArticlesByCategory(category: ResourceCategory) {
  return getIndexableResourceArticles().filter((article) => article.category === category);
}

export function getResourceArticlesByGroup(group: ResourceGroup) {
  return getIndexableResourceArticles().filter((article) => article.cluster === group);
}

export function getRelatedResourceArticles(article: ResourceArticle) {
  return article.relatedArticleSlugs
    .map((slug) => resourceArticleMap.get(slug))
    .filter((related): related is ResourceArticle => related !== undefined && related.status === "published");
}

export function formatResourceDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00Z`));
}

export function validateResourceArticles(articles: readonly ResourceArticle[] = resourceArticles) {
  const issues: ResourceValidationIssue[] = [];
  const slugs = new Map<string, string>();
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  const metaFingerprints = new Map<string, string>();
  const validCategories = new Set(Object.keys(resourceCategories));
  const validGroups = new Set(Object.keys(resourceGroups));

  for (const article of articles) {
    const parsed = resourceArticleSchema.safeParse(article);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push({
          slug: article.slug,
          field: issue.path.join("."),
          message: issue.message
        });
      }
    }

    addUniqueIssue(slugs, article.slug, article.slug, "slug", issues, "Duplicate slug");
    addUniqueIssue(titles, normaliseText(article.title), article.slug, "title", issues, "Duplicate title");
    addUniqueIssue(
      descriptions,
      normaliseText(article.description),
      article.slug,
      "description",
      issues,
      "Duplicate description"
    );
    addUniqueIssue(
      metaFingerprints,
      `${normaliseText(article.socialTitle)}:${normaliseText(article.socialDescription)}`,
      article.slug,
      "metadata",
      issues,
      "Duplicate social metadata"
    );

    if (!validCategories.has(article.category)) {
      issues.push({ slug: article.slug, field: "category", message: "Invalid category" });
    }

    if (!validGroups.has(article.cluster)) {
      issues.push({ slug: article.slug, field: "cluster", message: "Invalid resource group" });
    }

    if (article.status === "published" && article.officialSources.length === 0) {
      issues.push({
        slug: article.slug,
        field: "officialSources",
        message: "Published articles must include official sources"
      });
    }

    if (article.status === "draft" && article.robots !== "noindex") {
      issues.push({
        slug: article.slug,
        field: "robots",
        message: "Draft articles must be marked noindex"
      });
    }

    if (article.status === "published" && article.internalLinks.length === 0) {
      issues.push({
        slug: article.slug,
        field: "internalLinks",
        message: "Published articles must include meaningful internal links"
      });
    }

    if (article.status === "published" && getArticleBodyText(article).length < 1200) {
      issues.push({
        slug: article.slug,
        field: "content",
        message: "Published articles need more substantive content"
      });
    }

    if (article.canonicalUrl !== resourceUrl(article.slug)) {
      issues.push({
        slug: article.slug,
        field: "canonicalUrl",
        message: "Canonical URL must match the production resource URL"
      });
    }

    const combinedText = normaliseText(getArticleBodyText(article));
    for (const banned of ["guarantee compliance", "guaranteed compliance", "files your accounts", "files your confirmation statement", "automatically tracks", "placeholder", "lorem ipsum"]) {
      if (combinedText.includes(banned)) {
        issues.push({
          slug: article.slug,
          field: "content",
          message: `Unsupported or placeholder wording found: ${banned}`
        });
      }
    }

    for (const relatedSlug of article.relatedArticleSlugs) {
      const related = articles.find((candidate) => candidate.slug === relatedSlug);
      if (!related) {
        issues.push({
          slug: article.slug,
          field: "relatedArticleSlugs",
          message: `Broken related article reference: ${relatedSlug}`
        });
      } else if (article.status === "published" && related.status !== "published") {
        issues.push({
          slug: article.slug,
          field: "relatedArticleSlugs",
          message: `Published article references unpublished article: ${relatedSlug}`
        });
      }
    }

    const cta = resourceCtaVariants[article.ctaVariant];
    for (const [field, href] of [
      ["primaryHref", cta.primaryHref],
      ["secondaryHref", cta.secondaryHref]
    ] as const) {
      if (!href.startsWith("/")) {
        issues.push({
          slug: article.slug,
          field: `ctaVariant.${field}`,
          message: "Resource CTA destinations must be internal paths"
        });
      }
    }

    for (const link of article.internalLinks) {
      if (link.href === resourcePath(article.slug)) {
        issues.push({
          slug: article.slug,
          field: "internalLinks",
          message: "Article must not link to itself"
        });
      }
    }
  }

  for (let index = 0; index < articles.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < articles.length; nextIndex += 1) {
      const current = articles[index];
      const next = articles[nextIndex];
      if (jaccardSimilarity(current.description, next.description) > 0.82) {
        issues.push({
          slug: current.slug,
          field: "description",
          message: `Near-duplicate metadata with ${next.slug}`
        });
      }
    }
  }

  return issues;
}

function addUniqueIssue(
  seen: Map<string, string>,
  key: string,
  slug: string,
  field: string,
  issues: ResourceValidationIssue[],
  message: string
) {
  const previous = seen.get(key);
  if (previous) {
    issues.push({ slug, field, message: `${message}: ${previous}` });
    return;
  }
  seen.set(key, slug);
}

function normaliseText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getArticleBodyText(article: ResourceArticle) {
  return [
    article.summary,
    article.directAnswer,
    article.uniqueAngle,
    ...article.supportingQuestions,
    ...article.keyFacts,
    ...article.content.flatMap((section) => [
      section.heading,
      ...section.body,
      ...(section.subsections ?? []).flatMap((subsection) => [subsection.heading, ...subsection.body])
    ]),
    ...article.faqs.flatMap((faq) => [faq.question, faq.answer])
  ].join(" ");
}

function jaccardSimilarity(left: string, right: string) {
  const leftWords = new Set(normaliseText(left).split(" ").filter((word) => word.length > 3));
  const rightWords = new Set(normaliseText(right).split(" ").filter((word) => word.length > 3));
  const intersection = [...leftWords].filter((word) => rightWords.has(word)).length;
  const union = new Set([...leftWords, ...rightWords]).size;
  return union === 0 ? 0 : intersection / union;
}
