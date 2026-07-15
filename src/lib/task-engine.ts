import type { BusinessProfile, Prisma, TaskStatus, TaskUrgency } from "@prisma/client";
import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isValid,
  setMonth,
  setYear,
} from "date-fns";
import { plainCopy } from "@/content/plain-copy";
import { getPrisma } from "@/lib/prisma";

export const DEADLINE_RULE_VERSION = "stage-2-2026-07-14";
export const RULE_CHECKED_AT = new Date("2026-07-14T00:00:00.000Z");

type RuleSource = {
  title: string;
  url: string;
};

export type GeneratedTask = {
  key: string;
  title: string;
  plainEnglishSummary: string;
  dueDate: Date | null;
  urgency: TaskUrgency;
  status: TaskStatus;
  nextAction: string;
  whatThisMeans: string;
  whyYouMayNeedIt: string;
  calculationInput: Prisma.InputJsonValue;
  calculationExplanation: string;
  ruleVersion: string;
  sourceTitle: string;
  sourceCheckedAt: Date;
  missingInformation: string[];
  whatYouNeed: string[];
  checklist: string[];
  officialSourceUrl: string;
  adviceBoundary: string;
};

const sources = {
  limitedCompanyAccounts: {
    title: "Accounts and tax returns for private limited companies",
    url: "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company"
  },
  firstCompanyReturn: {
    title: "Your limited company's first accounts and Company Tax Return",
    url: "https://www.gov.uk/first-company-accounts-and-return"
  },
  confirmationStatement: {
    title: "File your confirmation statement with Companies House",
    url: "https://www.gov.uk/file-your-confirmation-statement-with-companies-house"
  },
  corporationTax: {
    title: "Pay your Corporation Tax bill",
    url: "https://www.gov.uk/pay-corporation-tax"
  },
  selfAssessment: {
    title: "Self Assessment tax returns",
    url: "https://www.gov.uk/self-assessment-tax-returns/deadlines"
  },
  paymentsOnAccount: {
    title: "Understand your Self Assessment tax bill",
    url: "https://www.gov.uk/understand-self-assessment-bill/payments-on-account"
  },
  vatReturns: {
    title: "Sending a VAT Return",
    url: "https://www.gov.uk/submit-vat-return"
  },
  paye: {
    title: "Register as an employer",
    url: "https://www.gov.uk/register-employer"
  }
} satisfies Record<string, RuleSource>;

export function parseUkDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(`${value}T12:00:00.000Z`);
  if (!isValid(date)) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12));
}

function dueStatus(dueDate: Date | null, today: Date): TaskStatus {
  if (!dueDate) return "NEEDS_INFORMATION";
  const days = differenceInCalendarDays(dueDate, parseUkDate(today) ?? today);
  if (days < 0) return "OVERDUE";
  if (days <= 30) return "DUE_SOON";
  return "COMING_UP";
}

export function daysUntilText(dueDate: Date | null, today = new Date()) {
  if (!dueDate) return "We need more information";
  const days = differenceInCalendarDays(dueDate, parseUkDate(today) ?? today);
  if (days === 0) return "Due today";
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} left`;
  return `${Math.abs(days)} day${days === -1 ? "" : "s"} overdue`;
}

function taxYearEndFor(date: Date) {
  const year = date.getUTCMonth() < 3 || (date.getUTCMonth() === 3 && date.getUTCDate() <= 5)
    ? date.getUTCFullYear()
    : date.getUTCFullYear() + 1;
  return new Date(Date.UTC(year, 3, 5, 12));
}

function selfAssessmentDeadlineForActivity(activityDate: Date) {
  const taxYearEnd = taxYearEndFor(activityDate);
  const deadlineYear = taxYearEnd.getUTCFullYear() + 1;
  return {
    taxYearEnd,
    registerBy: new Date(Date.UTC(taxYearEnd.getUTCFullYear(), 9, 5, 12)),
    onlineReturnBy: new Date(Date.UTC(deadlineYear, 0, 31, 12)),
    secondPaymentBy: new Date(Date.UTC(deadlineYear, 6, 31, 12))
  };
}

function accountingReferenceDate(incorporatedOn: Date) {
  return endOfMonth(addYears(incorporatedOn, 1));
}

function withFinancialYearEnd(profile: BusinessProfile, fallbackStart: Date) {
  const stored = parseUkDate(profile.firstAccountingPeriodEnd ?? profile.accountingReferenceDate);
  if (stored) return stored;
  if (profile.businessYearEndMonth) {
    const monthIndex = profile.businessYearEndMonth - 1;
    const candidate = endOfMonth(setMonth(setYear(fallbackStart, fallbackStart.getUTCFullYear()), monthIndex));
    return isBefore(candidate, fallbackStart) ? addYears(candidate, 1) : candidate;
  }
  return null;
}

function makeTask(
  task: Omit<
    GeneratedTask,
    "adviceBoundary" | "ruleVersion" | "sourceCheckedAt" | "status" | "sourceTitle" | "officialSourceUrl"
  > & {
    today: Date;
    source: RuleSource;
    status?: TaskStatus;
  }
): GeneratedTask {
  return {
    ...task,
    sourceTitle: task.source.title,
    officialSourceUrl: task.source.url,
    status: task.status ?? dueStatus(task.dueDate, task.today),
    sourceCheckedAt: RULE_CHECKED_AT,
    ruleVersion: DEADLINE_RULE_VERSION,
    adviceBoundary: plainCopy.adviceBoundary
  };
}

function missingTask({
  key,
  title,
  summary,
  missingInformation,
  nextAction,
  source,
  today
}: {
  key: string;
  title: string;
  summary: string;
  missingInformation: string[];
  nextAction: string;
  source: RuleSource;
  today: Date;
}) {
  return makeTask({
    key,
    title,
    plainEnglishSummary: summary,
    dueDate: null,
    urgency: "HIGH",
    status: "NEEDS_INFORMATION",
    nextAction,
    whatThisMeans: "Business Sorted cannot calculate this deadline until the missing business detail is saved.",
    whyYouMayNeedIt: "The official date depends on details that are different for each business.",
    calculationInput: { missingInformation },
    calculationExplanation: `Missing information: ${missingInformation.join(", ")}.`,
    missingInformation,
    whatYouNeed: missingInformation,
    checklist: ["Open Business settings.", "Add the missing detail.", "Save changes to recalculate your deadlines."],
    source,
    today
  });
}

export function buildDeadlineTasks(profile: BusinessProfile, today = new Date()): GeneratedTask[] {
  const safeToday = parseUkDate(today) ?? today;
  const tasks: GeneratedTask[] = [];
  const startedTradingOn = parseUkDate(profile.startedTradingOn);

  if (profile.businessType === "LIMITED_COMPANY") {
    const incorporatedOn = parseUkDate(profile.companyRegisteredOn);
    const firstAccountsEnd = incorporatedOn
      ? parseUkDate(profile.firstAccountingPeriodEnd) ?? accountingReferenceDate(incorporatedOn)
      : null;

    if (!incorporatedOn) {
      tasks.push(missingTask({
        key: "limited-company-first-accounts",
        title: "File your first company accounts",
        summary: "We need your incorporation date before we can calculate your first Companies House accounts deadline.",
        missingInformation: ["Incorporation date"],
        nextAction: "Add the date your company was incorporated.",
        source: sources.limitedCompanyAccounts,
        today: safeToday
      }));
    } else {
      const dueDate = addMonths(incorporatedOn, 21);
      tasks.push(makeTask({
        key: "limited-company-first-accounts",
        title: "File your first company accounts",
        plainEnglishSummary: "Your first accounts are the first set of company accounts sent to Companies House.",
        dueDate,
        urgency: "HIGH",
        nextAction: "Prepare your company records and file the accounts with Companies House.",
        whatThisMeans: "Companies House expects a private limited company to file accounts after the end of its first financial year.",
        whyYouMayNeedIt: "Late filing can lead to penalties and makes the public company record incomplete.",
        calculationInput: { incorporatedOn: format(incorporatedOn, "yyyy-MM-dd") },
        calculationExplanation: `GOV.UK says first accounts are due 21 months after registration. ${format(incorporatedOn, "d MMMM yyyy")} plus 21 months is ${format(dueDate, "d MMMM yyyy")}.`,
        missingInformation: [],
        whatYouNeed: ["Company number", "Financial records", "Accounts prepared from the company records"],
        checklist: ["Check the accounting period covered.", "Prepare or review the accounts.", "File with Companies House."],
        source: sources.limitedCompanyAccounts,
        today: safeToday
      }));
    }

    if (!incorporatedOn) {
      tasks.push(missingTask({
        key: "limited-company-confirmation-statement",
        title: "File your confirmation statement",
        summary: "We need your incorporation date before we can calculate your first confirmation statement date.",
        missingInformation: ["Incorporation date"],
        nextAction: "Add the date your company was incorporated.",
        source: sources.confirmationStatement,
        today: safeToday
      }));
    } else {
      const dueDate = addDays(addYears(incorporatedOn, 1), 14);
      tasks.push(makeTask({
        key: "limited-company-confirmation-statement",
        title: "File your confirmation statement",
        plainEnglishSummary: "This is a yearly check that your company details are still right.",
        dueDate,
        urgency: "NORMAL",
        nextAction: "Check the company record and file the confirmation statement with Companies House.",
        whatThisMeans: "A confirmation statement tells Companies House whether the company details on the public record are up to date.",
        whyYouMayNeedIt: "Every company needs to keep its Companies House record current.",
        calculationInput: { incorporatedOn: format(incorporatedOn, "yyyy-MM-dd") },
        calculationExplanation: `This task uses the first yearly review from incorporation, with 14 days allowed to file after the review date. The calculated date is ${format(dueDate, "d MMMM yyyy")}.`,
        missingInformation: [],
        whatYouNeed: ["Company number", "Companies House sign-in", "Current company details"],
        checklist: ["Check directors, registered office and shares.", "Update anything that changed.", "File the statement."],
        source: sources.confirmationStatement,
        today: safeToday
      }));
    }

    const corporationTaxStart = startedTradingOn ?? incorporatedOn;
    const accountsEnd = corporationTaxStart ? withFinancialYearEnd(profile, corporationTaxStart) ?? firstAccountsEnd : null;
    if (!corporationTaxStart || !accountsEnd) {
      tasks.push(missingTask({
        key: "limited-company-corporation-tax-payment",
        title: "Pay Corporation Tax or tell HMRC none is due",
        summary: "We need the company trading start date and accounting period end before calculating Corporation Tax payment.",
        missingInformation: [
          ...(!corporationTaxStart ? ["Date trading started"] : []),
          ...(!accountsEnd ? ["Accounting reference date or first accounting period end"] : [])
        ],
        nextAction: "Add your trading start date and accounting period details.",
        source: sources.corporationTax,
        today: safeToday
      }));
      tasks.push(missingTask({
        key: "limited-company-tax-return",
        title: "File your Company Tax Return",
        summary: "We need the company trading start date and accounting period end before calculating the Company Tax Return deadline.",
        missingInformation: [
          ...(!corporationTaxStart ? ["Date trading started"] : []),
          ...(!accountsEnd ? ["Accounting reference date or first accounting period end"] : [])
        ],
        nextAction: "Add your trading start date and accounting period details.",
        source: sources.firstCompanyReturn,
        today: safeToday
      }));
    } else {
      const paymentDue = addDays(addMonths(accountsEnd, 9), 1);
      const returnDue = addMonths(accountsEnd, 12);
      tasks.push(makeTask({
        key: "limited-company-corporation-tax-payment",
        title: "Pay Corporation Tax or tell HMRC none is due",
        plainEnglishSummary: "This is the date by which most small companies pay Corporation Tax for the accounting period.",
        dueDate: paymentDue,
        urgency: "HIGH",
        nextAction: "Check your company profit, then pay HMRC or tell HMRC there is no Corporation Tax to pay.",
        whatThisMeans: "Corporation Tax is tax on company profits. Business Sorted only tracks the deadline; it does not calculate or submit the payment.",
        whyYouMayNeedIt: "HMRC can charge interest if Corporation Tax is paid late.",
        calculationInput: { accountingPeriodEnd: format(accountsEnd, "yyyy-MM-dd") },
        calculationExplanation: `GOV.UK says most companies with taxable profits up to GBP 1.5 million pay 9 months and 1 day after the accounting period ends. ${format(accountsEnd, "d MMMM yyyy")} gives ${format(paymentDue, "d MMMM yyyy")}.`,
        missingInformation: [],
        whatYouNeed: ["Company accounts", "Profit calculation", "HMRC payment reference"],
        checklist: ["Review the accounting period.", "Work out whether Corporation Tax is due.", "Pay HMRC or tell HMRC no payment is due."],
        source: sources.corporationTax,
        today: safeToday
      }));
      tasks.push(makeTask({
        key: "limited-company-tax-return",
        title: "File your Company Tax Return",
        plainEnglishSummary: "A Company Tax Return tells HMRC about the company's taxable profit or loss.",
        dueDate: returnDue,
        urgency: "HIGH",
        nextAction: "Prepare the Company Tax Return and file it with HMRC.",
        whatThisMeans: "The Company Tax Return is sent to HMRC and is separate from filing accounts with Companies House.",
        whyYouMayNeedIt: "HMRC expects a return even where there is no Corporation Tax to pay if a notice to file has been issued.",
        calculationInput: { accountingPeriodEnd: format(accountsEnd, "yyyy-MM-dd") },
        calculationExplanation: `GOV.UK says the Company Tax Return is due 12 months after the accounting period ends. ${format(accountsEnd, "d MMMM yyyy")} gives ${format(returnDue, "d MMMM yyyy")}.`,
        missingInformation: [],
        whatYouNeed: ["Company accounts", "Tax calculations", "HMRC online account"],
        checklist: ["Check the period covered.", "Prepare the return.", "File with HMRC."],
        source: sources.firstCompanyReturn,
        today: safeToday
      }));
    }
  }

  if (profile.businessType === "SOLE_TRADER") {
    if (!startedTradingOn) {
      tasks.push(missingTask({
        key: "sole-trader-self-assessment-register",
        title: "Register for Self Assessment",
        summary: "We need the date you started trading before calculating when to tell HMRC.",
        missingInformation: ["Date trading started"],
        nextAction: "Add the first date you sold goods or services.",
        source: sources.selfAssessment,
        today: safeToday
      }));
    } else {
      const deadlines = selfAssessmentDeadlineForActivity(startedTradingOn);
      tasks.push(makeTask({
        key: "sole-trader-self-assessment-register",
        title: "Register for Self Assessment",
        plainEnglishSummary: "Tell HMRC you need to complete a tax return for the tax year you started trading.",
        dueDate: deadlines.registerBy,
        urgency: "HIGH",
        nextAction: "Register for Self Assessment if you have not already done it.",
        whatThisMeans: "Self Assessment is the HMRC process many sole traders use to report income and pay tax.",
        whyYouMayNeedIt: "HMRC needs to know that you need a return for the tax year.",
        calculationInput: { startedTradingOn: format(startedTradingOn, "yyyy-MM-dd"), taxYearEnd: format(deadlines.taxYearEnd, "yyyy-MM-dd") },
        calculationExplanation: `The tax year for this start date ends on ${format(deadlines.taxYearEnd, "d MMMM yyyy")}. GOV.UK says to tell HMRC by 5 October after that tax year.`,
        missingInformation: [],
        whatYouNeed: ["Business start date", "Government Gateway details if you have them", "Basic business details"],
        checklist: ["Check whether you already registered.", "Register with HMRC if needed.", "Keep HMRC letters safely."],
        source: sources.selfAssessment,
        today: safeToday
      }));
      tasks.push(makeTask({
        key: "sole-trader-self-assessment-return",
        title: "Send your online Self Assessment tax return",
        plainEnglishSummary: "This is the online return for the tax year in which this business activity sits.",
        dueDate: deadlines.onlineReturnBy,
        urgency: "HIGH",
        nextAction: "Prepare your income and cost records, then submit the return to HMRC.",
        whatThisMeans: "The return tells HMRC about your income, business costs and other details for the tax year.",
        whyYouMayNeedIt: "HMRC must receive the return by the deadline to avoid late-filing penalties.",
        calculationInput: { taxYearEnd: format(deadlines.taxYearEnd, "yyyy-MM-dd") },
        calculationExplanation: `GOV.UK says online returns are due by 31 January after the tax year. For the tax year ending ${format(deadlines.taxYearEnd, "d MMMM yyyy")}, that is ${format(deadlines.onlineReturnBy, "d MMMM yyyy")}.`,
        missingInformation: [],
        whatYouNeed: ["Sales records", "Business cost records", "Personal tax details"],
        checklist: ["Gather your records.", "Check the figures.", "Submit the return online."],
        source: sources.selfAssessment,
        today: safeToday
      }));
      tasks.push(makeTask({
        key: "sole-trader-tax-payment",
        title: "Pay your Self Assessment tax bill",
        plainEnglishSummary: "HMRC normally expects payment by the same date as the online return.",
        dueDate: deadlines.onlineReturnBy,
        urgency: "HIGH",
        nextAction: "Check your HMRC statement and pay any tax due.",
        whatThisMeans: "This is the payment date for tax owed through Self Assessment.",
        whyYouMayNeedIt: "HMRC can charge penalties or interest if tax is paid late.",
        calculationInput: { taxYearEnd: format(deadlines.taxYearEnd, "yyyy-MM-dd") },
        calculationExplanation: `GOV.UK says Self Assessment tax is due by 31 January after the tax year. The calculated date is ${format(deadlines.onlineReturnBy, "d MMMM yyyy")}.`,
        missingInformation: [],
        whatYouNeed: ["HMRC statement", "Payment reference", "Bank details"],
        checklist: ["Check what HMRC says is due.", "Choose a payment method.", "Allow time for the payment to reach HMRC."],
        source: sources.selfAssessment,
        today: safeToday
      }));
      tasks.push(makeTask({
        key: "sole-trader-payments-on-account",
        title: "Check whether payments on account apply",
        plainEnglishSummary: "Payments on account are advance payments towards your next Self Assessment bill.",
        dueDate: deadlines.secondPaymentBy,
        urgency: "NORMAL",
        nextAction: "Check your HMRC statement to see whether a payment on account is due.",
        whatThisMeans: "If they apply, payments on account are usually split across 31 January and 31 July.",
        whyYouMayNeedIt: "They can surprise first-time filers because the first payment can be due with the main tax bill.",
        calculationInput: { taxYearEnd: format(deadlines.taxYearEnd, "yyyy-MM-dd") },
        calculationExplanation: `GOV.UK says the second payment deadline is 31 July where payments on account apply. Business Sorted cannot know from your profile whether HMRC will require them, so this is a check task.`,
        missingInformation: [],
        whatYouNeed: ["HMRC Self Assessment statement", "Previous tax bill if any"],
        checklist: ["Open your HMRC statement.", "Check whether payments on account are listed.", "Ask a qualified tax adviser if you are unsure."],
        source: sources.paymentsOnAccount,
        today: safeToday
      }));
    }
  }

  if (profile.registeredForVat === "YES") {
    const vatPeriodEnd = parseUkDate(profile.vatPeriodEndsOn);
    if (!vatPeriodEnd) {
      tasks.push(missingTask({
        key: "vat-return",
        title: "Send your VAT Return",
        summary: "We need the VAT accounting period end date before calculating the VAT return deadline.",
        missingInformation: ["VAT accounting period end date"],
        nextAction: "Add the end date of your current VAT accounting period.",
        source: sources.vatReturns,
        today: safeToday
      }));
    } else {
      const dueDate = addDays(addMonths(vatPeriodEnd, 1), 7);
      tasks.push(makeTask({
        key: "vat-return",
        title: "Send your VAT Return",
        plainEnglishSummary: "A VAT Return tells HMRC how much VAT you charged and paid for the period.",
        dueDate,
        urgency: "HIGH",
        nextAction: "Prepare and submit your VAT Return, then pay HMRC if payment is due.",
        whatThisMeans: "If registered for VAT, you usually send a VAT Return even if there is no VAT to pay or reclaim.",
        whyYouMayNeedIt: "The VAT return and payment usually share the same deadline.",
        calculationInput: { vatPeriodEnd: format(vatPeriodEnd, "yyyy-MM-dd") },
        calculationExplanation: `GOV.UK says the deadline is usually one calendar month and 7 days after the VAT accounting period ends. ${format(vatPeriodEnd, "d MMMM yyyy")} gives ${format(dueDate, "d MMMM yyyy")}.`,
        missingInformation: [],
        whatYouNeed: ["VAT sales records", "VAT purchase records", "VAT online account"],
        checklist: ["Check the VAT period.", "Prepare the return.", "Submit and pay by the deadline."],
        source: sources.vatReturns,
        today: safeToday
      }));
    }
  }

  if (profile.employsPeople === "YES" || profile.worksAlone === "NO") {
    const firstPayday = parseUkDate(profile.firstPayday);
    const dueDate = firstPayday ? firstPayday : null;
    tasks.push(makeTask({
      key: "paye-register-employer",
      title: "Register as an employer and set up PAYE",
      plainEnglishSummary: "PAYE is the HMRC system for reporting employee pay and deductions.",
      dueDate,
      urgency: "HIGH",
      status: dueDate ? dueStatus(dueDate, safeToday) : "NEEDS_INFORMATION",
      nextAction: dueDate ? "Register before the first payday." : "Add the first payday so Business Sorted can show the deadline.",
      whatThisMeans: "HMRC usually expects employer registration before the first payday, including where a limited company only pays its director.",
      whyYouMayNeedIt: "You need an employer PAYE reference to run payroll properly.",
      calculationInput: { firstPayday: firstPayday ? format(firstPayday, "yyyy-MM-dd") : null },
      calculationExplanation: firstPayday
        ? `GOV.UK says to register before the first payday. Business Sorted shows ${format(firstPayday, "d MMMM yyyy")} as the latest date to handle this.`
        : "Missing first payday.",
      missingInformation: firstPayday ? [] : ["First payday"],
      whatYouNeed: ["Business details", "First payday", "HMRC online account"],
      checklist: ["Confirm whether the worker is an employee.", "Register with HMRC.", "Choose how payroll will be run."],
      source: sources.paye,
      today: safeToday
    }));
  }

  return tasks;
}

export async function syncBusinessTasks(businessId: string, userId?: string | null, today = new Date()) {
  const prisma = getPrisma();
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { profile: true, tasks: true }
  });

  if (!business?.profile) return { created: 0, updated: 0, skipped: 0 };

  const generated = buildDeadlineTasks(business.profile, today);
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const task of generated) {
    const existing = business.tasks.find((item) => item.key === task.key);
    const data = {
      title: task.title,
      plainEnglishSummary: task.plainEnglishSummary,
      dueDate: task.dueDate,
      urgency: task.urgency,
      status: existing?.status === "COMPLETED" || existing?.status === "NOT_APPLICABLE" ? existing.status : task.status,
      nextAction: task.nextAction,
      whatThisMeans: task.whatThisMeans,
      whyYouMayNeedIt: task.whyYouMayNeedIt,
      calculationInput: task.calculationInput,
      calculationExplanation: task.calculationExplanation,
      ruleVersion: task.ruleVersion,
      sourceTitle: task.sourceTitle,
      sourceCheckedAt: task.sourceCheckedAt,
      missingInformation: task.missingInformation,
      whatYouNeed: task.whatYouNeed,
      checklist: task.checklist,
      officialSourceUrl: task.officialSourceUrl,
      adviceBoundary: task.adviceBoundary
    };

    if (!existing) {
      const createdTask = await prisma.task.create({
        data: {
          businessId,
          key: task.key,
          ...data,
          history: {
            create: {
              userId,
              action: "CREATED",
              metadata: { ruleVersion: task.ruleVersion }
            }
          }
        }
      });
      if (createdTask) created += 1;
    } else if (existing.completedAt || existing.notApplicableAt) {
      await prisma.task.update({ where: { id: existing.id }, data });
      skipped += 1;
    } else {
      await prisma.task.update({
        where: { id: existing.id },
        data: {
          ...data,
          history: {
            create: {
              userId,
              action: "RECALCULATED",
              metadata: { ruleVersion: task.ruleVersion }
            }
          }
        }
      });
      updated += 1;
    }
  }

  return { created, updated, skipped };
}

export function taskDisplayBucket(status: TaskStatus, dueDate: Date | null) {
  if (status === "COMPLETED") return "Completed";
  if (status === "NOT_APPLICABLE") return "Not applicable";
  if (status === "NEEDS_INFORMATION") return "Needs attention";
  if (!dueDate) return "Needs attention";
  const today = parseUkDate(new Date()) ?? new Date();
  if (isAfter(today, dueDate) || status === "OVERDUE") return "Needs attention";
  if (differenceInCalendarDays(dueDate, today) <= 30) return "Needs attention";
  return "Coming up";
}
