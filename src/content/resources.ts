import { absoluteUrl } from "@/config/site";

export type ResourceGuide = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  h1: string;
  intro: string;
  appliesTo: string;
  whenApplies: string;
  deadlines: readonly string[];
  mistakes: readonly string[];
  penalties: string;
  sections: readonly (readonly [string, string])[];
  officialSources: readonly { label: string; href: string }[];
  faqs: readonly { question: string; answer: string }[];
  related: readonly string[];
  reviewed: string;
};

const hmrc = "https://www.gov.uk/government/organisations/hm-revenue-customs";
const companiesHouse = "https://www.gov.uk/government/organisations/companies-house";

export const resourceGuides = [
  {
    slug: "business-deadline-calendar",
    title: "UK Business Deadline Calendar",
    shortTitle: "Deadline calendar",
    description:
      "A plain-English guide to the main UK business deadlines first-time owners should understand, including Companies House, tax, VAT, PAYE and Self Assessment.",
    h1: "UK business deadline calendar for first-time owners",
    intro:
      "Business deadlines can feel scattered because different organisations handle different duties. Companies House deals with company filing, while HMRC deals with tax, VAT, PAYE and Self Assessment. This guide explains the main deadlines to know so you can build a simple calendar and avoid last-minute surprises.",
    appliesTo:
      "This guide is for first-time UK business owners, including sole traders, limited company directors and employers who want a clearer view of recurring administration.",
    whenApplies:
      "Deadlines depend on your business structure, accounting dates, VAT registration, PAYE setup and whether you need to file a Self Assessment tax return.",
    deadlines: [
      "Confirmation statement: usually every 12 months for limited companies.",
      "Annual accounts: normally due to Companies House after the company financial year ends.",
      "Corporation Tax return: usually due 12 months after the accounting period ends.",
      "Corporation Tax payment: often due before the return filing deadline.",
      "VAT Returns and payments: usually quarterly, unless HMRC has agreed a different scheme.",
      "PAYE: payroll reporting is usually on or before employees are paid.",
      "Self Assessment: key online filing and payment deadlines normally fall in January."
    ],
    mistakes: [
      "Treating all tax and filing deadlines as the same date.",
      "Forgetting that payment and filing deadlines can be different.",
      "Relying on memory instead of a calendar and source links.",
      "Missing Companies House letters or HMRC online account messages."
    ],
    penalties:
      "Late filing or payment can lead to penalties, interest, restrictions or further compliance checks. The exact result depends on the duty, the delay and your circumstances, so check the relevant official guidance.",
    sections: [
      [
        "What it is",
        "A business deadline calendar is a practical list of filing, reporting and payment dates. It is not a substitute for advice, but it helps you see what needs attention and which official source explains it."
      ],
      [
        "How to use it",
        "Start with your business structure, then add dates from Companies House and HMRC. Keep the source link with each task so you can check the wording before you file or pay."
      ],
      [
        "Why dates vary",
        "Limited company dates often depend on incorporation and accounting periods. VAT and PAYE dates depend on how HMRC has set up the account. Sole trader Self Assessment dates follow the tax year."
      ]
    ],
    officialSources: [
      { label: "HMRC", href: hmrc },
      { label: "Companies House", href: companiesHouse },
      { label: "Running a limited company", href: "https://www.gov.uk/running-a-limited-company" }
    ],
    faqs: [
      {
        question: "Are all UK business deadlines the same for every business?",
        answer:
          "No. Deadlines depend on your business structure, registrations, accounting dates and HMRC or Companies House requirements."
      },
      {
        question: "Should I rely only on a calendar reminder?",
        answer:
          "No. Use reminders, but keep official source links with each task so you can check the latest wording before acting."
      }
    ],
    related: ["companies-house-guide", "corporation-tax-guide", "vat-guide"],
    reviewed: "18 July 2026"
  },
  {
    slug: "companies-house-guide",
    title: "Companies House Guide for New Directors",
    shortTitle: "Companies House",
    description:
      "Plain-English guide to Companies House responsibilities for first-time UK limited company directors.",
    h1: "Companies House guide for first-time company directors",
    intro:
      "Companies House keeps the public register of UK companies. If you run a limited company, you usually need to keep company details up to date and file documents such as confirmation statements and annual accounts.",
    appliesTo:
      "This guide applies to UK limited companies and their directors. Sole traders do not file confirmation statements or company accounts with Companies House.",
    whenApplies:
      "Companies House duties start when a company is incorporated and continue while the company remains on the register, including dormant periods.",
    deadlines: [
      "Confirmation statement: usually every 12 months.",
      "Annual accounts: normally due after the financial year end.",
      "Company detail changes: update Companies House when required, such as changes to registered office or directors."
    ],
    mistakes: [
      "Assuming dormant companies have no Companies House duties.",
      "Confusing company accounts with Corporation Tax returns.",
      "Missing the confirmation statement because no trading has happened.",
      "Letting registered office details become outdated."
    ],
    penalties:
      "Late accounts can lead to automatic penalties. Continued failure to keep records or file required documents may create further consequences for the company and directors.",
    sections: [
      [
        "What it is",
        "Companies House is the official registrar of companies. It records company names, directors, registered offices, confirmation statements and accounts."
      ],
      [
        "What directors usually need to do",
        "Directors normally keep statutory information accurate, file confirmation statements, file annual accounts and make sure company records are kept."
      ],
      [
        "How it connects to HMRC",
        "Companies House and HMRC are separate. Filing accounts at Companies House does not automatically file every tax return or pay every tax bill."
      ]
    ],
    officialSources: [
      { label: "Companies House", href: companiesHouse },
      { label: "Running a limited company", href: "https://www.gov.uk/running-a-limited-company" },
      {
        label: "File a confirmation statement",
        href: "https://www.gov.uk/file-your-confirmation-statement-with-companies-house"
      }
    ],
    faqs: [
      {
        question: "Is Companies House the same as HMRC?",
        answer:
          "No. Companies House manages the company register. HMRC manages tax, VAT, PAYE and Self Assessment."
      },
      {
        question: "Do dormant companies still file with Companies House?",
        answer:
          "Usually yes. Dormant companies can still have Companies House filing duties, including accounts and confirmation statements."
      }
    ],
    related: ["confirmation-statement-guide", "annual-accounts-guide", "dormant-company-guide"],
    reviewed: "18 July 2026"
  },
  {
    slug: "corporation-tax-guide",
    title: "Corporation Tax Guide for New UK Companies",
    shortTitle: "Corporation Tax",
    description:
      "Understand Corporation Tax registration, payment and return deadlines in plain English for first-time UK company directors.",
    h1: "Corporation Tax guide for first-time UK company directors",
    intro:
      "Corporation Tax is the tax a limited company may pay on its profits. New directors often find it confusing because the tax payment deadline and the company tax return deadline are not necessarily the same date.",
    appliesTo:
      "This guide applies to UK limited companies. Sole traders usually deal with business profits through Self Assessment instead.",
    whenApplies:
      "Corporation Tax applies when a company is active for tax purposes and has taxable profits or needs to report its position to HMRC.",
    deadlines: [
      "Tell HMRC when the company starts business activity.",
      "Pay Corporation Tax by the relevant payment deadline for the accounting period.",
      "File the Company Tax Return, usually within 12 months of the accounting period end."
    ],
    mistakes: [
      "Waiting for the return deadline before thinking about payment.",
      "Assuming Companies House accounts are the same as a Company Tax Return.",
      "Not keeping records that explain income, expenses and adjustments.",
      "Ignoring HMRC letters or online account messages."
    ],
    penalties:
      "Late filing, late payment or inaccurate returns can lead to penalties and interest. HMRC guidance explains the current rules and how penalties are calculated.",
    sections: [
      [
        "What it is",
        "Corporation Tax is handled by HMRC and relates to company profits. The company normally needs accounting records to prepare figures correctly."
      ],
      [
        "Who it applies to",
        "It mainly applies to limited companies, clubs, societies and some other organisations. First-time directors should check how their company is treated by HMRC."
      ],
      [
        "How it links to annual accounts",
        "Company accounts and tax returns use related information, but they are not the same filing. You may need to file with both Companies House and HMRC."
      ]
    ],
    officialSources: [
      { label: "Corporation Tax", href: "https://www.gov.uk/corporation-tax" },
      { label: "Company Tax Returns", href: "https://www.gov.uk/company-tax-returns" },
      { label: "HMRC", href: hmrc }
    ],
    faqs: [
      {
        question: "Is Corporation Tax only for limited companies?",
        answer:
          "It mainly applies to limited companies and some organisations. Sole trader profits are usually handled through Self Assessment."
      },
      {
        question: "Is the Corporation Tax payment deadline the same as the return deadline?",
        answer:
          "Not always. The payment deadline can be earlier than the Company Tax Return filing deadline."
      }
    ],
    related: ["annual-accounts-guide", "companies-house-guide", "business-deadline-calendar"],
    reviewed: "18 July 2026"
  },
  {
    slug: "vat-guide",
    title: "VAT Guide for First-Time UK Business Owners",
    shortTitle: "VAT",
    description:
      "Plain-English guide to VAT registration, returns, payment deadlines and common mistakes for UK business owners.",
    h1: "VAT guide for first-time UK business owners",
    intro:
      "VAT can affect both sole traders and limited companies. You may need to register when your taxable turnover reaches the VAT threshold, or you may choose to register voluntarily if it makes sense for your business.",
    appliesTo:
      "This guide applies to UK businesses that are VAT registered or may need to register. VAT can apply regardless of whether the business is a sole trader or limited company.",
    whenApplies:
      "VAT applies when a business is registered for VAT and makes taxable supplies. Registration can become compulsory when turnover reaches the current threshold.",
    deadlines: [
      "Check whether turnover requires VAT registration.",
      "Submit VAT Returns by the deadline shown in the HMRC account.",
      "Pay VAT by the relevant payment deadline.",
      "Keep digital records where Making Tax Digital rules apply."
    ],
    mistakes: [
      "Checking turnover too late.",
      "Confusing sales income with profit.",
      "Missing VAT Return dates after registering.",
      "Forgetting that VAT records must support the return."
    ],
    penalties:
      "HMRC may charge penalties or interest for late VAT Returns, late payment or errors. The exact rules depend on the issue and current HMRC guidance.",
    sections: [
      [
        "What it is",
        "VAT is a tax on many goods and services. VAT-registered businesses usually charge VAT, keep VAT records and submit VAT Returns to HMRC."
      ],
      [
        "Who it applies to",
        "VAT can apply to sole traders, partnerships and limited companies. The key question is whether the business is registered or required to register."
      ],
      [
        "When to get help",
        "VAT can become detailed when you sell different types of goods or services, trade internationally or use special schemes. Professional advice can be useful."
      ]
    ],
    officialSources: [
      { label: "Register for VAT", href: "https://www.gov.uk/register-for-vat" },
      { label: "VAT Returns", href: "https://www.gov.uk/submit-vat-return" },
      { label: "HMRC", href: hmrc }
    ],
    faqs: [
      {
        question: "Does VAT apply only to limited companies?",
        answer:
          "No. VAT can apply to different business structures, including sole traders and limited companies."
      },
      {
        question: "Should I wait until year end to check VAT?",
        answer:
          "No. VAT registration depends on turnover over a period, so it is safer to monitor it during the year."
      }
    ],
    related: ["corporation-tax-guide", "paye-guide", "registering-a-limited-company"],
    reviewed: "18 July 2026"
  },
  {
    slug: "paye-guide",
    title: "PAYE Guide for New UK Employers",
    shortTitle: "PAYE",
    description:
      "A plain-English guide to PAYE deadlines, payroll reporting and common first-employer mistakes.",
    h1: "PAYE guide for first-time UK employers",
    intro:
      "PAYE is the system HMRC uses for collecting Income Tax and National Insurance from employment. If your business employs people, payroll tasks can become one of your most regular deadlines.",
    appliesTo:
      "This guide applies to businesses that employ staff or directors in circumstances where PAYE registration and payroll reporting are required.",
    whenApplies:
      "PAYE applies when you need to run payroll, report pay and deductions to HMRC, and pay what is due.",
    deadlines: [
      "Register as an employer when required.",
      "Send payroll information to HMRC on or before payday.",
      "Pay HMRC by the relevant PAYE payment deadline.",
      "Keep payroll records."
    ],
    mistakes: [
      "Paying someone before understanding payroll reporting.",
      "Missing the on-or-before-payday reporting requirement.",
      "Confusing contractor payments with employee payroll.",
      "Not keeping payroll evidence."
    ],
    penalties:
      "Late payroll reports, late payments or inaccurate submissions can lead to HMRC penalties and interest. Check HMRC guidance for the current rules.",
    sections: [
      [
        "What it is",
        "PAYE is HMRC's payroll system for employment taxes. Employers use it to report pay, Income Tax, National Insurance and other payroll details."
      ],
      [
        "Who it applies to",
        "It can apply when you employ staff or pay directors. The exact position depends on pay, benefits and the worker relationship."
      ],
      [
        "How it fits with other deadlines",
        "PAYE can sit alongside VAT, Corporation Tax and Companies House responsibilities, so it helps to keep all recurring deadlines in one place."
      ]
    ],
    officialSources: [
      { label: "PAYE and payroll for employers", href: "https://www.gov.uk/paye-for-employers" },
      { label: "Register as an employer", href: "https://www.gov.uk/register-employer" },
      { label: "HMRC", href: hmrc }
    ],
    faqs: [
      {
        question: "Do I need PAYE before hiring someone?",
        answer:
          "You may need to register as an employer before the first payday. Check HMRC guidance for your situation."
      },
      {
        question: "Is PAYE the same as Corporation Tax?",
        answer:
          "No. PAYE is payroll reporting and payment. Corporation Tax relates to company profits."
      }
    ],
    related: ["vat-guide", "corporation-tax-guide", "business-deadline-calendar"],
    reviewed: "18 July 2026"
  },
  {
    slug: "self-assessment-guide",
    title: "Self Assessment Guide for Sole Traders",
    shortTitle: "Self Assessment",
    description:
      "Understand Self Assessment registration, tax returns, payments on account and record keeping in plain English.",
    h1: "Self Assessment guide for sole traders",
    intro:
      "Self Assessment is how many sole traders report business income to HMRC. It may also apply to company directors or people with other untaxed income, but this guide focuses on first-time business owners.",
    appliesTo:
      "This guide is especially useful for sole traders and people who need to report business income through a tax return.",
    whenApplies:
      "Self Assessment usually works around the UK tax year, with registration, filing and payment deadlines set by HMRC.",
    deadlines: [
      "Register for Self Assessment when required.",
      "Keep records throughout the tax year.",
      "File the tax return by the relevant deadline.",
      "Pay tax and any payments on account by HMRC deadlines."
    ],
    mistakes: [
      "Waiting until January to organise records.",
      "Confusing income with profit.",
      "Forgetting payments on account may apply.",
      "Not saving money for tax as income arrives."
    ],
    penalties:
      "Late filing, late payment or inaccurate returns can lead to penalties and interest. HMRC publishes the rules and current deadlines.",
    sections: [
      [
        "What it is",
        "Self Assessment is HMRC's tax return process for people who need to report income that is not fully taxed at source."
      ],
      [
        "Who it applies to",
        "It commonly applies to sole traders. Some directors, landlords or people with other income may also need to use Self Assessment."
      ],
      [
        "Records to keep",
        "Keep invoices, receipts, bank records and notes that explain income and allowable expenses. Good records make deadlines less stressful."
      ]
    ],
    officialSources: [
      { label: "Self Assessment tax returns", href: "https://www.gov.uk/self-assessment-tax-returns" },
      { label: "Set up as a sole trader", href: "https://www.gov.uk/become-sole-trader" },
      { label: "HMRC", href: hmrc }
    ],
    faqs: [
      {
        question: "Is Self Assessment only for sole traders?",
        answer:
          "No. Sole traders commonly use it, but other people may need to file depending on their income and circumstances."
      },
      {
        question: "Do I need records before filing?",
        answer:
          "Yes. Records support the figures on your tax return and help you answer HMRC questions."
      }
    ],
    related: ["business-deadline-calendar", "vat-guide", "paye-guide"],
    reviewed: "18 July 2026"
  },
  {
    slug: "confirmation-statement-guide",
    title: "Confirmation Statement Guide",
    shortTitle: "Confirmation statement",
    description:
      "Plain-English guide to the Companies House confirmation statement, who files it and common mistakes.",
    h1: "Confirmation statement guide for UK limited companies",
    intro:
      "A confirmation statement tells Companies House that key information about a company is correct or has been updated. It is a recurring duty for limited companies.",
    appliesTo:
      "This guide applies to UK limited companies, including companies that have not traded or are dormant.",
    whenApplies:
      "A confirmation statement is usually due at least once every 12 months, based on the company's review period.",
    deadlines: [
      "Check the company's review period.",
      "Update company information if needed.",
      "File the confirmation statement by the Companies House deadline."
    ],
    mistakes: [
      "Assuming no changes means no filing is needed.",
      "Missing people with significant control information.",
      "Leaving registered office details out of date.",
      "Confusing the confirmation statement with annual accounts."
    ],
    penalties:
      "Failure to file required company information can lead to enforcement action. Check Companies House guidance for the current process.",
    sections: [
      [
        "What it is",
        "The confirmation statement is a Companies House filing that confirms company details such as registered office, directors, shareholders and people with significant control."
      ],
      [
        "Who it applies to",
        "It applies to limited companies on the register, even if the company has not changed much since the last filing."
      ],
      [
        "How to prepare",
        "Review company details before filing. If something is wrong, update it through the correct Companies House process."
      ]
    ],
    officialSources: [
      {
        label: "File a confirmation statement",
        href: "https://www.gov.uk/file-your-confirmation-statement-with-companies-house"
      },
      { label: "Companies House", href: companiesHouse }
    ],
    faqs: [
      {
        question: "Do I file a confirmation statement if nothing changed?",
        answer:
          "Usually yes. The filing confirms the details are correct, even if there are no changes."
      },
      {
        question: "Is a confirmation statement the same as accounts?",
        answer:
          "No. It is a separate Companies House filing from annual accounts."
      }
    ],
    related: ["companies-house-guide", "annual-accounts-guide", "dormant-company-guide"],
    reviewed: "18 July 2026"
  },
  {
    slug: "registering-a-limited-company",
    title: "Registering a Limited Company Guide",
    shortTitle: "Registering a company",
    description:
      "Plain-English guide to registering a UK limited company and the first deadlines directors should know.",
    h1: "Registering a limited company in plain English",
    intro:
      "Registering a limited company creates a separate legal structure from the people who own or run it. It can be the right structure for some businesses, but it also brings Companies House and HMRC responsibilities.",
    appliesTo:
      "This guide is for first-time UK founders considering or recently completing limited company registration.",
    whenApplies:
      "It applies before and just after incorporation, when you choose company details and prepare for first filings and tax setup.",
    deadlines: [
      "Choose and register company details.",
      "Keep statutory records from the start.",
      "Understand first accounts and confirmation statement dates.",
      "Tell HMRC when the company starts business activity."
    ],
    mistakes: [
      "Registering before understanding director responsibilities.",
      "Ignoring the first accounts deadline.",
      "Using a registered office without understanding mail handling.",
      "Assuming company registration automatically covers VAT, PAYE or all taxes."
    ],
    penalties:
      "Missing post-registration duties can lead to Companies House or HMRC penalties depending on the missed task. Check official guidance before acting.",
    sections: [
      [
        "What it is",
        "Incorporation creates a limited company on the Companies House register. Directors then have duties to keep records and file information."
      ],
      [
        "Who it applies to",
        "It applies to founders who want to trade through a limited company rather than as a sole trader or another structure."
      ],
      [
        "What comes next",
        "After registration, directors should note accounts, confirmation statement, Corporation Tax, VAT and PAYE tasks where relevant."
      ]
    ],
    officialSources: [
      { label: "Set up a limited company", href: "https://www.gov.uk/limited-company-formation" },
      { label: "Running a limited company", href: "https://www.gov.uk/running-a-limited-company" },
      { label: "Companies House", href: companiesHouse }
    ],
    faqs: [
      {
        question: "Does registering a company register me for VAT?",
        answer:
          "No. VAT registration is a separate HMRC process when it is required or chosen voluntarily."
      },
      {
        question: "Do directors have deadlines straight away?",
        answer:
          "Yes. Some dates may be months away, but responsibilities start when the company exists and begins relevant activity."
      }
    ],
    related: ["confirmation-statement-guide", "annual-accounts-guide", "vat-guide"],
    reviewed: "18 July 2026"
  },
  {
    slug: "annual-accounts-guide",
    title: "Annual Accounts Guide",
    shortTitle: "Annual accounts",
    description:
      "Understand limited company annual accounts, Companies House filing and how accounts differ from tax returns.",
    h1: "Annual accounts guide for first-time company directors",
    intro:
      "Annual accounts are a key Companies House filing for limited companies. They explain the company's financial position for a period and are separate from the Corporation Tax return sent to HMRC.",
    appliesTo:
      "This guide applies to limited companies and directors responsible for filing accounts with Companies House.",
    whenApplies:
      "Accounts normally apply for each company financial year, including years when the company is dormant.",
    deadlines: [
      "Know the company accounting reference date.",
      "Prepare accounts from accurate records.",
      "File accounts with Companies House by the deadline.",
      "Use the records to support Corporation Tax where relevant."
    ],
    mistakes: [
      "Confusing annual accounts with the Company Tax Return.",
      "Leaving bookkeeping until the filing deadline.",
      "Assuming dormant status removes every filing duty.",
      "Missing first accounts dates after incorporation."
    ],
    penalties:
      "Late Companies House accounts can trigger automatic penalties. The penalty can increase depending on how late the accounts are.",
    sections: [
      [
        "What it is",
        "Annual accounts are financial statements prepared for a company period and filed with Companies House in the required form."
      ],
      [
        "Who it applies to",
        "Limited companies usually need to prepare and file accounts. The filing type can depend on company size and status."
      ],
      [
        "Why records matter",
        "Good records help accounts, tax returns and director decisions. Poor records make deadlines harder and increase the risk of mistakes."
      ]
    ],
    officialSources: [
      { label: "File your annual accounts", href: "https://www.gov.uk/file-your-company-annual-accounts" },
      { label: "Running a limited company", href: "https://www.gov.uk/running-a-limited-company" },
      { label: "Companies House", href: companiesHouse }
    ],
    faqs: [
      {
        question: "Are annual accounts sent to HMRC?",
        answer:
          "Companies House accounts and HMRC tax returns are separate, even though they may use related financial records."
      },
      {
        question: "Can a dormant company have accounts?",
        answer:
          "Yes. Dormant companies normally still have Companies House accounts duties."
      }
    ],
    related: ["companies-house-guide", "corporation-tax-guide", "dormant-company-guide"],
    reviewed: "18 July 2026"
  },
  {
    slug: "dormant-company-guide",
    title: "Dormant Company Guide",
    shortTitle: "Dormant company",
    description:
      "Plain-English guide to dormant company duties, Companies House filings and what first-time directors should check.",
    h1: "Dormant company guide for first-time directors",
    intro:
      "A dormant company may not be trading, but it can still have filing responsibilities. Directors often miss this because no income has arrived and no customer work is happening.",
    appliesTo:
      "This guide applies to limited companies that are dormant or expected to remain inactive for a period.",
    whenApplies:
      "Dormant status depends on the company's activity and how Companies House and HMRC treat it. You should check both organisations where relevant.",
    deadlines: [
      "Confirm whether the company is dormant for Companies House purposes.",
      "Check HMRC expectations for Corporation Tax.",
      "File dormant company accounts where required.",
      "File the confirmation statement by its deadline."
    ],
    mistakes: [
      "Assuming no trading means no Companies House filings.",
      "Ignoring HMRC Corporation Tax letters.",
      "Missing confirmation statement dates.",
      "Using the company bank account in a way that affects dormant status."
    ],
    penalties:
      "Late accounts or missed statutory filings can still create penalties for dormant companies. Check Companies House and HMRC guidance for your exact position.",
    sections: [
      [
        "What it is",
        "A dormant company is generally inactive for certain filing purposes. The exact meaning can differ depending on whether you are dealing with Companies House or HMRC."
      ],
      [
        "Who it applies to",
        "It applies to limited companies that are not currently trading or receiving income, but remain registered."
      ],
      [
        "Why it still needs attention",
        "Dormant does not mean forgotten. Keep a calendar for accounts, confirmation statements and any HMRC communication."
      ]
    ],
    officialSources: [
      { label: "Dormant companies and associations", href: "https://www.gov.uk/dormant-company" },
      { label: "Companies House", href: companiesHouse },
      { label: "HMRC", href: hmrc }
    ],
    faqs: [
      {
        question: "Does a dormant company still file a confirmation statement?",
        answer:
          "Usually yes. A confirmation statement is separate from trading activity."
      },
      {
        question: "Can HMRC and Companies House treat dormant status differently?",
        answer:
          "They can use different rules and processes, so check the relevant official guidance."
      }
    ],
    related: ["annual-accounts-guide", "confirmation-statement-guide", "companies-house-guide"],
    reviewed: "18 July 2026"
  }
] as const satisfies readonly ResourceGuide[];

export const resourceGuideMap: ReadonlyMap<string, ResourceGuide> = new Map(
  resourceGuides.map((guide) => [guide.slug, guide])
);

export function getGuide(slug: string) {
  return resourceGuideMap.get(slug);
}

export function resourcePath(slug: string) {
  return `/resources/${slug}`;
}

export function resourceUrl(slug: string) {
  return absoluteUrl(resourcePath(slug));
}
