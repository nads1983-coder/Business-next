export type SourceLink = {
  title: string;
  url: string;
};

export type Guide = {
  slug: string;
  category: "companies-house" | "hmrc" | "limited-companies" | "sole-traders" | "business-admin";
  title: string;
  description: string;
  primaryKeyword: string;
  supportingKeywords: string[];
  intent: string;
  conversionGoal: string;
  summary: string;
  answer: string;
  lastChecked: string;
  sections: {
    heading: string;
    body: string[];
  }[];
  checklist: string[];
  mistakes: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
  sources: SourceLink[];
  related: string[];
};

export const lastChecked = "16 July 2026";

export const categoryLabels = {
  "companies-house": "Companies House",
  hmrc: "HMRC",
  "limited-companies": "Limited companies",
  "sole-traders": "Sole traders",
  "business-admin": "Business admin"
} as const;

export const guideHubs = [
  {
    path: "/guides/companies-house",
    title: "Companies House guides",
    description: "Plain-English help with confirmation statements, accounts and Companies House filing tasks.",
    primaryKeyword: "Companies House deadline reminders"
  },
  {
    path: "/guides/hmrc",
    title: "HMRC guides",
    description: "Understand Corporation Tax, Self Assessment, VAT and HMRC deadline reminders.",
    primaryKeyword: "HMRC deadline reminders for limited companies"
  },
  {
    path: "/guides/limited-companies",
    title: "Limited company guides",
    description: "Checklists and explainers for first-time UK company directors.",
    primaryKeyword: "limited company responsibilities UK"
  },
  {
    path: "/guides/sole-traders",
    title: "Sole trader guides",
    description: "Record-keeping and tax deadline guidance for sole traders and freelancers.",
    primaryKeyword: "sole trader tax deadline checklist"
  },
  {
    path: "/guides/business-admin",
    title: "Business admin guides",
    description: "Practical admin checklists for keeping a small UK business organised.",
    primaryKeyword: "small business admin checklist"
  }
] as const;

export const guides: Guide[] = [
  {
    slug: "what-to-do-after-registering-a-limited-company",
    category: "limited-companies",
    title: "What to do after registering a limited company",
    description: "A first-time director checklist for the admin, tax and filing tasks to organise after forming a UK limited company.",
    primaryKeyword: "what to do after registering a limited company",
    supportingKeywords: ["first-time company director checklist", "limited company responsibilities UK", "first-year limited company checklist UK"],
    intent: "A new director wants the next practical steps after incorporation.",
    conversionGoal: "Start onboarding to build a personalised company checklist.",
    summary: "After registering a limited company, you need to keep company records, understand Companies House and HMRC deadlines, set up sensible record-keeping, and know when to ask an accountant or tax adviser.",
    answer: "After registering a limited company, your first job is to organise the company records, understand your director responsibilities, prepare for annual accounts, Company Tax Returns, Corporation Tax and confirmation statements, and keep evidence for business income and costs.",
    lastChecked,
    sections: [
      {
        heading: "Set up the company admin basics",
        body: [
          "Save your certificate of incorporation, company number, authentication code, articles of association and shareholder details somewhere you can find them quickly.",
          "Check that the registered office, directors, people with significant control and share information are correct, because these details feed future Companies House filings."
        ]
      },
      {
        heading: "Understand the first deadlines",
        body: [
          "A private limited company's first accounts are usually due at Companies House 21 months after registration. Later annual accounts are usually due 9 months after the financial year ends.",
          "Corporation Tax is usually due 9 months and 1 day after the accounting period ends, while the Company Tax Return is due 12 months after the accounting period ends."
        ]
      },
      {
        heading: "Keep records from day one",
        body: [
          "Keep invoices, receipts, bank records, payroll records if you employ people, VAT records if registered, and evidence for business expenses.",
          "Business Sorted can help you turn these obligations into plain-English tasks, but it does not replace professional advice."
        ]
      }
    ],
    checklist: [
      "Save incorporation documents and Companies House authentication details.",
      "Add the first accounts, Company Tax Return, Corporation Tax and confirmation statement dates to a deadline tracker.",
      "Set up a separate business bank account or a clear record-keeping process.",
      "Decide whether you need an accountant, payroll, VAT registration or professional insurance.",
      "Keep source links to official GOV.UK guidance beside each deadline."
    ],
    mistakes: [
      "Assuming Companies House and HMRC deadlines are the same.",
      "Waiting until the first year end before organising records.",
      "Thinking an accountant removes the director's legal responsibility.",
      "Losing the Companies House authentication code."
    ],
    faqs: [
      {
        question: "Do I need to file anything immediately after incorporation?",
        answer: "Not always, but you should organise your records and future deadlines immediately so the first accounts, tax and confirmation statement tasks do not arrive as a surprise."
      },
      {
        question: "Can Business Sorted tell me my exact dates?",
        answer: "Business Sorted is designed to help you organise deadline reminders from your business details and official source links. You should still check official records and professional advice where needed."
      }
    ],
    sources: [
      { title: "GOV.UK: Running a limited company responsibilities", url: "https://www.gov.uk/running-a-limited-company" },
      { title: "GOV.UK: Accounts and tax returns for private limited companies", url: "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company" }
    ],
    related: ["first-year-limited-company-checklist-uk", "uk-limited-company-filing-deadlines", "director-responsibilities-uk"]
  },
  {
    slug: "first-year-limited-company-checklist-uk",
    category: "limited-companies",
    title: "First-year limited company checklist UK",
    description: "A practical first-year checklist for UK limited company directors covering records, accounts, Corporation Tax and confirmation statements.",
    primaryKeyword: "first-year limited company checklist UK",
    supportingKeywords: ["limited company deadline reminders", "first-time company director checklist", "business compliance checklist UK"],
    intent: "A new director wants a first-year compliance checklist.",
    conversionGoal: "Build a personalised first-year checklist.",
    summary: "Your first year is mostly about setting up clean records, checking your Companies House information, and preparing for accounts and tax deadlines before they become urgent.",
    answer: "In the first year of a UK limited company, track your first accounts deadline, Corporation Tax payment deadline, Company Tax Return deadline and first confirmation statement, while keeping complete company and accounting records.",
    lastChecked,
    sections: [
      {
        heading: "The core first-year tasks",
        body: [
          "Directors must keep company records, prepare annual accounts, complete a Company Tax Return where required, file accounts and tax returns, and pay Corporation Tax when due.",
          "The first accounts deadline is often different from later annual accounts deadlines, so it deserves a separate reminder."
        ]
      },
      {
        heading: "What to keep evidence for",
        body: [
          "Keep sales records, receipts, bank statements, loan agreements, payroll details, dividends, expenses and any VAT records if your company is VAT registered.",
          "A tidy first year makes the Company Tax Return easier and reduces the chance of missed information."
        ]
      }
    ],
    checklist: [
      "Confirm company details at Companies House.",
      "Record first accounts and Company Tax Return dates.",
      "Record the Corporation Tax payment date.",
      "Prepare a confirmation statement reminder.",
      "Create a monthly admin habit for invoices, receipts and bank reconciliation."
    ],
    mistakes: [
      "Treating the first accounts deadline as a normal 9-month accounts deadline.",
      "Only tracking Companies House and forgetting HMRC.",
      "Not keeping paperwork for director loans, expenses or dividends."
    ],
    faqs: [
      {
        question: "What is the most commonly missed first-year deadline?",
        answer: "Many new directors confuse accounts, Corporation Tax and Company Tax Return dates because they are related but not identical."
      }
    ],
    sources: [
      { title: "GOV.UK: Accounts and tax returns for private limited companies", url: "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company" },
      { title: "GOV.UK: Running a limited company responsibilities", url: "https://www.gov.uk/running-a-limited-company" }
    ],
    related: ["what-to-do-after-registering-a-limited-company", "annual-accounts-deadline-explained", "corporation-tax-deadlines-for-limited-companies"]
  },
  {
    slug: "uk-limited-company-filing-deadlines",
    category: "business-admin",
    title: "UK limited company filing deadlines explained",
    description: "The key Companies House and HMRC filing deadlines UK limited company directors should track.",
    primaryKeyword: "UK limited company filing deadlines",
    supportingKeywords: ["business deadline calendar UK", "limited company deadline reminders", "HMRC deadline reminders for limited companies"],
    intent: "A director wants a single explanation of recurring company deadlines.",
    conversionGoal: "Use Business Sorted as a business deadline calendar.",
    summary: "Limited companies often need separate reminders for Companies House accounts, confirmation statements, Corporation Tax payment and Company Tax Returns.",
    answer: "The main UK limited company deadlines to track are annual accounts, confirmation statements, Corporation Tax payment and Company Tax Returns. Some companies also need VAT, PAYE, pensions or industry-specific reminders.",
    lastChecked,
    sections: [
      {
        heading: "Companies House deadlines",
        body: [
          "Annual accounts are filed with Companies House. Confirmation statements are also filed with Companies House to confirm key company information remains accurate.",
          "The first accounts deadline is usually 21 months after registration, while later annual accounts are usually due 9 months after the financial year ends."
        ]
      },
      {
        heading: "HMRC deadlines",
        body: [
          "Corporation Tax payment is usually due 9 months and 1 day after the accounting period ends for companies with taxable profits up to GBP 1.5 million.",
          "The Company Tax Return deadline is 12 months after the end of the accounting period it covers."
        ]
      }
    ],
    checklist: [
      "Annual accounts deadline.",
      "Confirmation statement deadline.",
      "Corporation Tax payment deadline.",
      "Company Tax Return deadline.",
      "VAT, PAYE and pension duties if relevant."
    ],
    mistakes: [
      "Using the financial year end as the filing deadline.",
      "Assuming a dormant company has no Companies House duties.",
      "Only setting one reminder instead of warning points before the deadline."
    ],
    faqs: [
      {
        question: "Are Companies House and HMRC deadlines the same?",
        answer: "No. They can relate to the same financial period but the filing and payment deadlines are different."
      }
    ],
    sources: [
      { title: "GOV.UK: Accounts and tax returns for private limited companies", url: "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company" },
      { title: "GOV.UK: Pay your Corporation Tax bill", url: "https://www.gov.uk/pay-corporation-tax" },
      { title: "GOV.UK: Company Tax Returns", url: "https://www.gov.uk/company-tax-returns" }
    ],
    related: ["confirmation-statement-deadline-explained", "annual-accounts-deadline-explained", "how-to-avoid-missing-companies-house-and-hmrc-deadlines"]
  },
  {
    slug: "confirmation-statement-deadline-explained",
    category: "companies-house",
    title: "Confirmation statement deadline explained",
    description: "What a confirmation statement is, when it is due and how UK directors can avoid missing the Companies House deadline.",
    primaryKeyword: "confirmation statement deadline",
    supportingKeywords: ["when is my confirmation statement due", "Companies House deadline reminders", "file confirmation statement"],
    intent: "A director wants to understand or check the confirmation statement deadline.",
    conversionGoal: "Add a confirmation statement reminder.",
    summary: "A confirmation statement tells Companies House that important company information is correct. Directors should track it as a recurring Companies House task.",
    answer: "A confirmation statement is the Companies House filing used to confirm that the company's registered information is accurate. Business owners should track the due date and prepare any updates before filing.",
    lastChecked,
    sections: [
      {
        heading: "What the confirmation statement is for",
        body: [
          "It is used to confirm information such as directors, registered office, shareholders and people with significant control.",
          "Companies House also offers email alerts to help companies know when a confirmation statement is due."
        ]
      },
      {
        heading: "How to stay organised",
        body: [
          "Keep Companies House login details and the authentication code secure, check company details before the due date, and set more than one reminder.",
          "If identity verification applies, make sure directors have the personal code they need before filing."
        ]
      }
    ],
    checklist: [
      "Check the Companies House due date.",
      "Review directors, registered office, share and PSC details.",
      "Prepare any changes before filing.",
      "Keep proof of filing with company records."
    ],
    mistakes: [
      "Assuming there is nothing to file because no details changed.",
      "Leaving Companies House login or identity checks until the deadline day."
    ],
    faqs: [
      {
        question: "Do I file a confirmation statement if nothing changed?",
        answer: "Yes, the purpose is to confirm the information is correct, even if there are no changes."
      }
    ],
    sources: [
      { title: "GOV.UK: File your confirmation statement", url: "https://www.gov.uk/file-your-confirmation-statement-with-companies-house" },
      { title: "GOV.UK: Running a limited company responsibilities", url: "https://www.gov.uk/running-a-limited-company" }
    ],
    related: ["uk-limited-company-filing-deadlines", "director-responsibilities-uk", "how-to-avoid-missing-companies-house-and-hmrc-deadlines"]
  },
  {
    slug: "annual-accounts-deadline-explained",
    category: "companies-house",
    title: "Annual accounts deadline explained",
    description: "Understand UK annual accounts deadlines for private limited companies and how they differ from tax return deadlines.",
    primaryKeyword: "annual accounts deadline UK",
    supportingKeywords: ["limited company deadline reminders", "Companies House deadline reminders", "first accounts deadline"],
    intent: "A director wants to know when annual accounts are due.",
    conversionGoal: "Track annual accounts in Business Sorted.",
    summary: "Annual accounts are prepared from company records and filed with Companies House. They are separate from the Company Tax Return sent to HMRC.",
    answer: "For a private limited company, first accounts are usually due 21 months after registration with Companies House. Later annual accounts are usually due 9 months after the company financial year ends.",
    lastChecked,
    sections: [
      {
        heading: "What annual accounts include",
        body: [
          "Statutory accounts are prepared from the company's financial records at the end of the financial year.",
          "They generally include a balance sheet, profit and loss account, notes and, for some companies, a director's report or auditor's report."
        ]
      },
      {
        heading: "Why the accounts deadline is easy to confuse",
        body: [
          "Accounts go to Companies House, while the Company Tax Return goes to HMRC. The accounts and tax return can sometimes be filed together, but the deadlines are not the same.",
          "Business Sorted separates the tasks so directors can see what is due, who it goes to and what source to check."
        ]
      }
    ],
    checklist: [
      "Check the accounting reference date.",
      "Confirm whether this is the first accounts period.",
      "Gather bank records, invoices and receipts.",
      "Agree who prepares and files the accounts.",
      "Set reminders before the final due date."
    ],
    mistakes: [
      "Using the Company Tax Return deadline as the Companies House accounts deadline.",
      "Leaving accountant handover too late.",
      "Not checking whether first accounts have a different deadline."
    ],
    faqs: [
      {
        question: "Are annual accounts the same as a Company Tax Return?",
        answer: "No. Annual accounts are company accounts, while the Company Tax Return is the HMRC tax filing. They are related but distinct."
      }
    ],
    sources: [
      { title: "GOV.UK: Prepare annual accounts", url: "https://www.gov.uk/annual-accounts" },
      { title: "GOV.UK: Accounts and tax returns for private limited companies", url: "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company" }
    ],
    related: ["corporation-tax-deadlines-for-limited-companies", "uk-limited-company-filing-deadlines", "first-year-limited-company-checklist-uk"]
  },
  {
    slug: "corporation-tax-deadlines-for-limited-companies",
    category: "hmrc",
    title: "Corporation Tax deadlines for limited companies",
    description: "Plain-English guide to Corporation Tax payment and Company Tax Return deadlines for UK limited companies.",
    primaryKeyword: "corporation tax deadline for limited company",
    supportingKeywords: ["HMRC deadline reminders for limited companies", "Company Tax Return deadline", "limited company tax deadline"],
    intent: "A company owner wants to understand Corporation Tax timing.",
    conversionGoal: "Create HMRC deadline reminders.",
    summary: "Corporation Tax payment and Company Tax Return filing are different HMRC tasks with different deadlines.",
    answer: "For many companies, Corporation Tax is paid 9 months and 1 day after the accounting period ends. The Company Tax Return is usually due 12 months after the end of the accounting period it covers.",
    lastChecked,
    sections: [
      {
        heading: "Payment and filing are separate",
        body: [
          "HMRC says companies with taxable profits up to GBP 1.5 million usually pay Corporation Tax 9 months and 1 day after the end of the accounting period.",
          "The Company Tax Return deadline is usually 12 months after the end of the accounting period. A company may still need to file even if it has a loss or no Corporation Tax to pay."
        ]
      },
      {
        heading: "Why new companies should be careful",
        body: [
          "The year you set up a company can involve more than one accounting period for Corporation Tax.",
          "If anything is unusual, confirm the dates in HMRC and Companies House records or ask a qualified adviser."
        ]
      }
    ],
    checklist: [
      "Find the accounting period end date.",
      "Add the Corporation Tax payment deadline.",
      "Add the Company Tax Return filing deadline.",
      "Keep the payment reference and HMRC login details secure.",
      "Confirm whether instalment rules apply if profits are high."
    ],
    mistakes: [
      "Waiting until the tax return deadline to pay Corporation Tax.",
      "Assuming no return is needed because there is no tax to pay.",
      "Not checking payment clearing time."
    ],
    faqs: [
      {
        question: "Is Corporation Tax due before the Company Tax Return?",
        answer: "Usually, yes. For many companies, payment is due 9 months and 1 day after the period ends, while the return is due 12 months after the period ends."
      }
    ],
    sources: [
      { title: "GOV.UK: Pay your Corporation Tax bill", url: "https://www.gov.uk/pay-corporation-tax" },
      { title: "GOV.UK: Company Tax Returns", url: "https://www.gov.uk/company-tax-returns" }
    ],
    related: ["annual-accounts-deadline-explained", "uk-limited-company-filing-deadlines", "how-to-avoid-missing-companies-house-and-hmrc-deadlines"]
  },
  {
    slug: "director-responsibilities-uk",
    category: "limited-companies",
    title: "Director responsibilities in the UK",
    description: "The main UK company director responsibilities explained in plain English for first-time directors.",
    primaryKeyword: "director responsibilities UK",
    supportingKeywords: ["limited company responsibilities UK", "first-time company director checklist", "business compliance checklist UK"],
    intent: "A director wants to understand their legal and admin responsibilities.",
    conversionGoal: "Create a director responsibilities checklist.",
    summary: "Directors can hire help, but they remain legally responsible for company records, accounts, tax filings and company performance.",
    answer: "A UK limited company director must follow the company's rules, keep company records, report required changes, prepare accounts, complete tax filings where required and make sure Corporation Tax is paid.",
    lastChecked,
    sections: [
      {
        heading: "The director remains responsible",
        body: [
          "GOV.UK states that directors may hire others to manage tasks day to day, but they are still legally responsible for the company's records, accounts and performance.",
          "This is why a reminder system should show both the task and the official source behind it."
        ]
      },
      {
        heading: "What Business Sorted helps with",
        body: [
          "Business Sorted is built to make responsibilities easier to see, organise and revisit in plain English.",
          "It is general information and organisation support, not personalised legal, tax or accounting advice."
        ]
      }
    ],
    checklist: [
      "Follow the articles of association.",
      "Keep company and accounting records.",
      "Report required company changes.",
      "Prepare annual accounts.",
      "Complete Company Tax Return tasks and pay Corporation Tax where required."
    ],
    mistakes: [
      "Assuming an accountant takes over legal responsibility.",
      "Not checking company records after changes.",
      "Mixing personal and company money without clear records."
    ],
    faqs: [
      {
        question: "Can I outsource director tasks?",
        answer: "You can hire help for day-to-day work, but GOV.UK makes clear that directors remain legally responsible."
      }
    ],
    sources: [
      { title: "GOV.UK: Running a limited company responsibilities", url: "https://www.gov.uk/running-a-limited-company" }
    ],
    related: ["what-to-do-after-registering-a-limited-company", "first-year-limited-company-checklist-uk", "confirmation-statement-deadline-explained"]
  },
  {
    slug: "small-business-administration-checklist",
    category: "business-admin",
    title: "Small-business administration checklist",
    description: "A practical UK small-business admin checklist for records, deadlines, tax reminders and recurring paperwork.",
    primaryKeyword: "small business admin checklist",
    supportingKeywords: ["business paperwork organiser UK", "business compliance checklist UK", "business deadline tracker UK"],
    intent: "A small-business owner wants a clear recurring admin routine.",
    conversionGoal: "Build a personalised business admin checklist.",
    summary: "Good business admin means knowing what records to keep, what filings are coming up, what evidence supports tax returns, and where official guidance lives.",
    answer: "A UK small-business admin checklist should cover record-keeping, filing deadlines, tax reminders, Companies House or Self Assessment tasks, VAT or PAYE if relevant, and a regular review habit.",
    lastChecked,
    sections: [
      {
        heading: "Monthly admin",
        body: [
          "Reconcile bank transactions, save receipts, issue and chase invoices, check upcoming deadlines and update business records.",
          "Small habits reduce the risk of a stressful annual scramble."
        ]
      },
      {
        heading: "Annual admin",
        body: [
          "Limited companies usually need accounts, tax and confirmation statement reminders. Sole traders usually need Self Assessment and record-keeping reminders.",
          "VAT, PAYE, pensions, licences and insurance can add extra recurring tasks."
        ]
      }
    ],
    checklist: [
      "Bank records and receipts.",
      "Invoices and payment chasing.",
      "Tax return evidence.",
      "Companies House or Self Assessment deadlines.",
      "VAT, PAYE and pension reminders if relevant."
    ],
    mistakes: [
      "Only thinking about admin at tax return time.",
      "Keeping records in too many disconnected places.",
      "Not linking tasks to official guidance."
    ],
    faqs: [
      {
        question: "How often should I review business admin?",
        answer: "Monthly is a sensible minimum for many small businesses, with extra checks before filing or payment deadlines."
      }
    ],
    sources: [
      { title: "GOV.UK: Running a limited company responsibilities", url: "https://www.gov.uk/running-a-limited-company" },
      { title: "GOV.UK: Become a sole trader", url: "https://www.gov.uk/become-sole-trader" }
    ],
    related: ["uk-limited-company-filing-deadlines", "sole-trader-tax-and-record-keeping-checklist", "how-to-avoid-missing-companies-house-and-hmrc-deadlines"]
  },
  {
    slug: "sole-trader-tax-and-record-keeping-checklist",
    category: "sole-traders",
    title: "Sole trader tax and record-keeping checklist",
    description: "A plain-English checklist for UK sole traders covering Self Assessment, records and tax deadline reminders.",
    primaryKeyword: "sole trader tax deadline checklist",
    supportingKeywords: ["sole trader record keeping UK", "Self Assessment deadline", "bookkeeping reminders for small businesses"],
    intent: "A sole trader wants a record-keeping and tax deadline checklist.",
    conversionGoal: "Create sole trader tax reminders.",
    summary: "Sole traders need clear records of business income and costs, and usually use Self Assessment to report taxable profit.",
    answer: "A sole trader should keep records from the start of trading, register for Self Assessment when required, track the 5 October registration deadline where relevant, and plan for paper and online tax return deadlines.",
    lastChecked,
    sections: [
      {
        heading: "When to register",
        body: [
          "GOV.UK says you can start trading straight away, but you must register for Self Assessment as a sole trader if you earn more than GBP 1,000 in a tax year.",
          "For a new Self Assessment obligation, HMRC usually requires registration by 5 October after the relevant tax year."
        ]
      },
      {
        heading: "Self Assessment dates to track",
        body: [
          "For the 2025 to 2026 tax year, GOV.UK lists the paper return deadline as 31 October 2026 and the online return/payment deadline as 31 January 2027.",
          "Keep enough money aside for tax and National Insurance, and ask HMRC or an adviser if you are unsure."
        ]
      }
    ],
    checklist: [
      "Track sales, invoices and bank income.",
      "Keep receipts and allowable expense evidence.",
      "Register for Self Assessment when required.",
      "Add paper and online Self Assessment deadlines.",
      "Review VAT registration requirements as income grows."
    ],
    mistakes: [
      "Forgetting the 5 October registration point.",
      "Mixing personal and business records without notes.",
      "Waiting until January to gather a full year of evidence."
    ],
    faqs: [
      {
        question: "Do sole traders use Corporation Tax?",
        answer: "No. GOV.UK says sole traders and partnerships use Self Assessment, not a Company Tax Return."
      }
    ],
    sources: [
      { title: "GOV.UK: Become a sole trader", url: "https://www.gov.uk/become-sole-trader" },
      { title: "GOV.UK: Self Assessment deadlines", url: "https://www.gov.uk/self-assessment-tax-returns/deadlines" },
      { title: "GOV.UK: Company Tax Returns", url: "https://www.gov.uk/company-tax-returns" }
    ],
    related: ["small-business-administration-checklist", "how-to-avoid-missing-companies-house-and-hmrc-deadlines"]
  },
  {
    slug: "how-to-avoid-missing-companies-house-and-hmrc-deadlines",
    category: "business-admin",
    title: "How to avoid missing Companies House and HMRC deadlines",
    description: "A practical reminder system for UK founders who need to stay on top of Companies House and HMRC tasks.",
    primaryKeyword: "Companies House and HMRC deadline reminders",
    supportingKeywords: ["business deadline tracker UK", "business compliance app UK", "bookkeeping reminders for small businesses"],
    intent: "A founder wants a system to avoid missed filings and penalties.",
    conversionGoal: "Start Business Sorted setup.",
    summary: "The safest approach is to separate each deadline, attach the official source, add early warnings and review the list monthly.",
    answer: "To avoid missing Companies House and HMRC deadlines, record each filing and payment separately, check dates against official records, add reminders well before the due date, and keep the evidence needed to complete each task.",
    lastChecked,
    sections: [
      {
        heading: "Build a two-body deadline list",
        body: [
          "Separate Companies House tasks, such as accounts and confirmation statements, from HMRC tasks, such as Corporation Tax, Company Tax Returns, VAT, PAYE or Self Assessment.",
          "Each task should have a due date, official source link, owner, evidence list and early reminder."
        ]
      },
      {
        heading: "Use reminders before the deadline day",
        body: [
          "A final-day reminder is too late if you need accountant input, a Companies House authentication code, identity verification, bank payment clearing time or missing records.",
          "Business Sorted is designed around this kind of plain-English task preparation."
        ]
      }
    ],
    checklist: [
      "List Companies House and HMRC tasks separately.",
      "Add source links and last-checked dates.",
      "Set warning reminders before the final deadline.",
      "Review admin monthly.",
      "Ask a professional where the task depends on your specific circumstances."
    ],
    mistakes: [
      "Using one annual reminder for several different obligations.",
      "Not allowing time for payment clearing.",
      "Relying on memory instead of a written system."
    ],
    faqs: [
      {
        question: "Should I track filing and payment separately?",
        answer: "Yes. For Corporation Tax, the payment deadline and Company Tax Return filing deadline are usually different."
      }
    ],
    sources: [
      { title: "GOV.UK: Accounts and tax returns for private limited companies", url: "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company" },
      { title: "GOV.UK: Pay your Corporation Tax bill", url: "https://www.gov.uk/pay-corporation-tax" },
      { title: "GOV.UK: File your confirmation statement", url: "https://www.gov.uk/file-your-confirmation-statement-with-companies-house" }
    ],
    related: ["uk-limited-company-filing-deadlines", "confirmation-statement-deadline-explained", "corporation-tax-deadlines-for-limited-companies"]
  }
];

export const keywordMap = [
  { route: "/", intent: "Product discovery", primary: "UK business deadline and compliance tracker", conversion: "Find my business deadlines" },
  { route: "/deadlines", intent: "Deadline overview", primary: "business deadline calendar UK", conversion: "Create deadline reminders" },
  { route: "/checklists", intent: "Checklist discovery", primary: "business compliance checklist UK", conversion: "Build my personalised business checklist" },
  { route: "/guides", intent: "Learning hub", primary: "UK small business admin guides", conversion: "Choose a guide and start setup" },
  { route: "/glossary", intent: "Definition lookup", primary: "UK business admin glossary", conversion: "Understand a term and continue to guides" },
  { route: "/about", intent: "Trust and entity validation", primary: "Business Sorted UK compliance assistant", conversion: "Start setup or contact support" },
  ...guides.map((guide) => ({
    route: `/guides/${guide.category}/${guide.slug}`,
    intent: guide.intent,
    primary: guide.primaryKeyword,
    conversion: guide.conversionGoal
  }))
];

export function findGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function guidesForCategory(category: Guide["category"]) {
  return guides.filter((guide) => guide.category === category);
}
