import { z } from "zod";
import { absoluteUrl } from "@/config/site";

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

export type ResourceCategory = keyof typeof resourceCategories;

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
const ctaVariantSchema = z.enum([
  "companies-house-obligations",
  "deadline-dashboard"
] satisfies [keyof typeof resourceCtaVariants, keyof typeof resourceCtaVariants]);

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
  body: z.array(z.string().min(40)).min(1)
});

const resourceArticleSchema = z.object({
  title: z.string().min(10),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(80).max(170),
  category: resourceCategorySchema,
  searchIntent: z.string().min(20),
  primaryKeyword: z.string().min(3),
  secondaryKeywords: z.array(z.string().min(3)).min(2),
  targetAudience: z.string().min(20),
  summary: z.string().min(80),
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

const companiesHouseSources = {
  runningCompanyConfirmationStatement: {
    label: "Running a limited company: confirmation statement",
    href: "https://www.gov.uk/running-a-limited-company/confirmation-statement",
    publisher: "GOV.UK"
  },
  confirmationStatementService: {
    label: "File a confirmation statement",
    href: "https://find-and-update.company-information.service.gov.uk/confirmation-statement",
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
  companiesHouseAccountsGuidance: {
    label: "Preparing and filing Companies House accounts",
    href: "https://www.gov.uk/government/publications/life-of-a-company-annual-requirements/life-of-a-company-part-1-accounts",
    publisher: "Companies House"
  }
} as const;

export const resourceArticles = [
  {
    title: "Confirmation statement guide for UK limited company directors",
    slug: "confirmation-statement-guide",
    description:
      "Understand what a Companies House confirmation statement is, when UK limited companies usually file it and what directors should check before filing.",
    category: "companies-house",
    searchIntent:
      "A UK limited company director wants to understand the confirmation statement duty, due date and preparation steps.",
    primaryKeyword: "confirmation statement guide",
    secondaryKeywords: [
      "Companies House confirmation statement",
      "confirmation statement deadline",
      "UK company director filing duties"
    ],
    targetAudience:
      "First-time UK limited company directors and small-business owners responsible for company filings.",
    summary:
      "A confirmation statement is the Companies House filing used to confirm that key company information is correct. Companies normally need to review their records and file at least one confirmation statement every 12 months.",
    content: [
      {
        id: "what-it-is",
        heading: "What a confirmation statement is",
        body: [
          "A confirmation statement tells Companies House that the information on the public company register is correct or has been updated. It covers details such as the registered office, directors, shareholders, standard industrial classification code and people with significant control.",
          "The filing is separate from annual accounts. A company can have no major changes and still need to file because the statement confirms the register position for the review period."
        ]
      },
      {
        id: "when-it-is-due",
        heading: "When the confirmation statement is due",
        body: [
          "Companies House guidance says a company must review its records and file at least one confirmation statement every 12 months. The review period normally ends 12 months after incorporation for the first statement, or 12 months after the confirmation statement date on the previous statement.",
          "The statement can usually be filed up to 14 days after the review period ends. Directors should still check the company register for the exact filing deadline before relying on a reminder."
        ]
      },
      {
        id: "what-to-check",
        heading: "What to check before filing",
        body: [
          "Before filing, check the company number, authentication code, registered office, officers, shareholder details, people with significant control and SIC code. Some details must be updated using a separate Companies House process before the statement is filed.",
          "Companies House currently lists online and postal filing routes, with different fees. Check the official service before filing because fees, service rules and required information can change."
        ]
      },
      {
        id: "how-businesssorted-helps",
        heading: "How BusinessSorted can help",
        body: [
          "BusinessSorted helps keep the confirmation statement visible alongside other important company obligations and deadlines. It is designed for organisation and plain-English context, not for filing the statement on your behalf."
        ]
      }
    ],
    keyFacts: [
      "A confirmation statement confirms that key Companies House register information is correct or updated.",
      "Companies normally need to file at least one confirmation statement every 12 months.",
      "Companies House says the statement can usually be filed up to 14 days after the review period ends.",
      "The confirmation statement is separate from annual accounts and HMRC tax returns."
    ],
    faqs: [
      {
        question: "Do I need to file a confirmation statement if nothing has changed?",
        answer:
          "Usually yes. The statement confirms that the information Companies House holds is correct, so a company can still need to file even when there have been no changes."
      },
      {
        question: "Can I use a confirmation statement to change every company detail?",
        answer:
          "No. Companies House guidance says some details need a separate update process. Check the official guidance before filing so the register is correct."
      }
    ],
    relatedArticleSlugs: ["annual-accounts-guide"],
    relatedProductFeature: "Companies House obligation tracking",
    ctaVariant: "companies-house-obligations",
    officialSources: [
      companiesHouseSources.runningCompanyConfirmationStatement,
      companiesHouseSources.confirmationStatementService
    ],
    sourceCheckedDate: "2026-07-18",
    lastReviewedDate: "2026-07-18",
    author: "Business Sorted editorial team",
    status: "published",
    featured: true,
    estimatedReadingTime: 5,
    canonicalUrl: absoluteUrl("/resources/confirmation-statement-guide"),
    robots: "index",
    socialTitle: "Confirmation statement guide for UK directors",
    socialDescription:
      "Plain-English Companies House confirmation statement guidance for UK limited company directors, with official source links and review dates.",
    internalLinks: [
      { label: "Companies House resources", href: "/resources/companies-house" },
      { label: "Annual accounts guide", href: "/resources/annual-accounts-guide" },
      { label: "How we research", href: "/how-we-research" },
      { label: "BusinessSorted pricing", href: "/pricing" }
    ]
  },
  {
    title: "Annual accounts guide for UK limited company directors",
    slug: "annual-accounts-guide",
    description:
      "Understand what annual accounts are, common Companies House filing deadlines and how accounts differ from HMRC Company Tax Returns.",
    category: "companies-house",
    searchIntent:
      "A UK limited company director wants to understand annual accounts, Companies House deadlines and how accounts relate to tax returns.",
    primaryKeyword: "annual accounts guide",
    secondaryKeywords: [
      "Companies House accounts deadline",
      "limited company annual accounts",
      "first company accounts deadline"
    ],
    targetAudience:
      "First-time UK limited company directors preparing for company accounts and related filing tasks.",
    summary:
      "Annual accounts are statutory accounts prepared from company financial records. Private limited companies usually file accounts with Companies House after the financial year, while HMRC Company Tax Returns follow their own deadline.",
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
        id: "companies-house-deadlines",
        heading: "Companies House accounts deadlines",
        body: [
          "For private limited companies, GOV.UK says first accounts are usually due 21 months after registration with Companies House. Later annual accounts are usually due 9 months after the company financial year ends.",
          "Companies House guidance also explains that the first accounts deadline can depend on the period covered by the accounts. Directors should check the company record and official guidance for the exact date rather than copying a generic example."
        ]
      },
      {
        id: "records-to-prepare",
        heading: "Records to prepare before accounts",
        body: [
          "Directors should keep records that explain company income, costs, assets, liabilities, bank activity and decisions. Good records make accounts preparation easier and reduce last-minute work.",
          "If the company is small, a micro-entity or dormant, simpler accounts may be available. That does not mean the filing can be ignored, so check the current Companies House route before the deadline."
        ]
      },
      {
        id: "how-businesssorted-helps",
        heading: "How BusinessSorted can help",
        body: [
          "BusinessSorted helps directors keep accounts preparation and filing tasks visible with related source links and review dates. It does not prepare statutory accounts or replace an accountant or tax adviser."
        ]
      }
    ],
    keyFacts: [
      "Annual accounts are statutory accounts prepared from the company financial records.",
      "GOV.UK says first private limited company accounts are usually due 21 months after registration.",
      "Later private limited company accounts are usually due 9 months after the company financial year ends.",
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
    relatedArticleSlugs: ["confirmation-statement-guide"],
    relatedProductFeature: "Accounts preparation reminders",
    ctaVariant: "companies-house-obligations",
    officialSources: [
      companiesHouseSources.accountsAndTaxReturns,
      companiesHouseSources.annualAccounts,
      companiesHouseSources.companiesHouseAccountsGuidance
    ],
    sourceCheckedDate: "2026-07-18",
    lastReviewedDate: "2026-07-18",
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
      { label: "Confirmation statement guide", href: "/resources/confirmation-statement-guide" },
      { label: "How we research", href: "/how-we-research" },
      { label: "BusinessSorted pricing", href: "/pricing" }
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
    addUniqueIssue(
      titles,
      normaliseText(article.title),
      article.slug,
      "title",
      issues,
      "Duplicate title"
    );
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

    for (const relatedSlug of article.relatedArticleSlugs) {
      if (!articles.some((candidate) => candidate.slug === relatedSlug)) {
        issues.push({
          slug: article.slug,
          field: "relatedArticleSlugs",
          message: `Broken related article reference: ${relatedSlug}`
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
    ...article.keyFacts,
    ...article.content.flatMap((section) => [section.heading, ...section.body]),
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
