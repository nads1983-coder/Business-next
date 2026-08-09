export const mtdStripeLinks = {
  starterPack: "https://buy.stripe.com/6oU28ra2o3z89fTciSgA80a",
  setupKit: "https://buy.stripe.com/5kQ7sL4I41r0eAder0gA80b"
} as const;

export const mtdProducts = {
  starterPack: {
    name: "MTD Starter Pack",
    price: "£19",
    href: "/mtd-starter-pack",
    checkoutUrl: mtdStripeLinks.starterPack,
    description:
      "A simple readiness pack for sole traders and landlords who need to understand their MTD dates, records and quarterly routine.",
    includes: [
      "MTD readiness checklist",
      "Quarterly update calendar",
      "Expense categories cheat sheet",
      "Sole trader spreadsheet template outline",
      "Landlord spreadsheet template outline",
      "Questions to send to your accountant"
    ]
  },
  setupKit: {
    name: "MTD Setup Kit",
    price: "£49",
    href: "/mtd-setup-kit",
    checkoutUrl: mtdStripeLinks.setupKit,
    description:
      "The fuller setup kit for turning MTD anxiety into a weekly and quarterly digital record keeping system.",
    includes: [
      "Everything in the Starter Pack",
      "Digital record keeping workflow",
      "Receipt naming system",
      "Quarterly update checklist",
      "MTD software chooser",
      "Landlord and sole trader setup checklists"
    ]
  }
} as const;

export const mtdContentPages = [
  {
    slug: "sole-traders",
    title: "Making Tax Digital for Sole Traders",
    description:
      "Plain-English guide to Making Tax Digital for sole traders, including thresholds, dates, records and what to prepare next.",
    h1: "Making Tax Digital for sole traders",
    intro:
      "If you are self-employed, MTD for Income Tax is mainly a question of qualifying income, Self Assessment status and whether your records are ready for quarterly updates.",
    sections: [
      {
        heading: "Who this affects",
        body:
          "MTD for Income Tax applies in phases to sole traders registered for Self Assessment when qualifying self-employment income is over the published threshold for the relevant tax year."
      },
      {
        heading: "What to prepare",
        body:
          "You should know your qualifying income, choose compatible software or bridging software, and create a repeatable routine for income, expenses, receipts and bank records."
      },
      {
        heading: "Best next step",
        body:
          "Use the free checker first, then build a quarterly system before the deadline reaches you. The risk is leaving all record changes until the first quarterly update is due."
      }
    ],
    faqs: [
      ["Do sole traders need MTD?", "Sole traders may need MTD for Income Tax if they are in Self Assessment and their qualifying self-employment income is over the relevant threshold."],
      ["Does employment income count?", "Employment income is separate. The planning check should focus on qualifying self-employment and property income."]
    ]
  },
  {
    slug: "landlords",
    title: "Making Tax Digital for Landlords",
    description:
      "Check what UK landlords need to know about Making Tax Digital for Income Tax, property income thresholds and digital record keeping.",
    h1: "Making Tax Digital for landlords",
    intro:
      "Landlords need to pay close attention to property income thresholds, record keeping and whether their current spreadsheet or agent statements can feed MTD-compatible software.",
    sections: [
      {
        heading: "Who this affects",
        body:
          "MTD for Income Tax can apply to landlords registered for Self Assessment when qualifying property income is above the relevant phase-in threshold."
      },
      {
        heading: "Records to organise",
        body:
          "Keep rent, allowable expenses, mortgage interest records, agent fees, repairs, insurance and mileage or travel notes in a consistent digital routine."
      },
      {
        heading: "Best next step",
        body:
          "Check your likely start date and decide whether a bookkeeping app, landlord software or spreadsheet plus bridging software fits your setup."
      }
    ],
    faqs: [
      ["Do landlords need MTD?", "Landlords may need MTD for Income Tax if they are in Self Assessment and their qualifying property income is over the threshold."],
      ["Can landlords use spreadsheets?", "Spreadsheets may need compatible bridging software before they can be used for MTD submissions."]
    ]
  },
  {
    slug: "quarterly-update-dates",
    title: "MTD Quarterly Update Dates",
    description:
      "Understand the quarterly rhythm behind Making Tax Digital for Income Tax and what sole traders and landlords should prepare.",
    h1: "MTD quarterly update dates",
    intro:
      "MTD changes the rhythm of tax admin. Instead of relying only on a January Self Assessment rush, you need a quarterly process for digital records and updates.",
    sections: [
      {
        heading: "What quarterly updates mean",
        body:
          "Quarterly updates are based on digital records. They are not a full tax return by themselves, but they require a working record keeping system."
      },
      {
        heading: "What to do each quarter",
        body:
          "Reconcile income, categorise expenses, attach receipts, review unusual transactions and check whether your software is ready to submit the update."
      },
      {
        heading: "Best next step",
        body:
          "Create a repeatable month-end routine now so each quarterly update becomes a review task rather than a rescue job."
      }
    ],
    faqs: [
      ["Is an MTD quarterly update the same as a tax return?", "No. It is part of the MTD process, but you still need year-end finalisation through the required HMRC process."],
      ["Should I wait until my deadline?", "No. The admin burden is lower if you build the routine before your first required update."]
    ]
  },
  {
    slug: "software-for-sole-traders",
    title: "MTD Software for Sole Traders",
    description:
      "Compare what sole traders should look for in Making Tax Digital software, including records, categories, receipts and accountant access.",
    h1: "MTD software for sole traders",
    intro:
      "The best MTD software is the one you will actually keep updated. Sole traders should prioritise simple income capture, expense categories and accountant access.",
    sections: [
      {
        heading: "Core features to check",
        body:
          "Look for MTD compatibility, bank feeds, receipt capture, expense categories, quarterly update support and clear exports for your accountant."
      },
      {
        heading: "Spreadsheet users",
        body:
          "If you want to keep spreadsheets, check whether bridging software is enough. If your records are messy, a bookkeeping app may reduce errors."
      },
      {
        heading: "Best next step",
        body:
          "Choose based on the workflow you can repeat weekly, not just the cheapest monthly price."
      }
    ],
    faqs: [
      ["Can I use free software for MTD?", "Possibly, depending on your needs and the software available. Check compatibility and whether it covers your income type."],
      ["Should I ask my accountant first?", "Yes, especially if they will submit updates or review your records."]
    ]
  },
  {
    slug: "expenses-checklist",
    title: "MTD Expenses Checklist",
    description:
      "A practical MTD expenses checklist for sole traders and landlords preparing digital records for quarterly updates.",
    h1: "MTD expenses checklist",
    intro:
      "The biggest MTD problem is not usually the submission button. It is inconsistent records. A clear expense checklist helps you keep each quarter tidy.",
    sections: [
      {
        heading: "Common expense areas",
        body:
          "Typical areas include software, stationery, phone, internet, professional fees, travel, mileage, insurance, repairs, agent fees and bank charges."
      },
      {
        heading: "Receipt routine",
        body:
          "Use a consistent file name with date, supplier, amount and category. Attach receipts to the transaction in your bookkeeping tool where possible."
      },
      {
        heading: "Best next step",
        body:
          "Create categories once, then review them every month so quarterly updates are based on clean records."
      }
    ],
    faqs: [
      ["Is this tax advice?", "No. It is an organisation checklist. Ask an accountant which expenses are allowable for your situation."],
      ["Do I need receipts?", "Keep evidence for business expenses and organise it digitally so records can be reviewed later."]
    ]
  }
] as const;

export type MtdContentPage = (typeof mtdContentPages)[number];
