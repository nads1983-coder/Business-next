import type { BusinessProfile, TaskUrgency } from "@prisma/client";
import { addMonths, endOfMonth } from "date-fns";
import { plainCopy } from "@/content/plain-copy";

type GeneratedTask = {
  title: string;
  plainEnglishSummary: string;
  dueDate: Date;
  urgency: TaskUrgency;
  whatYouNeed: string[];
  checklist: string[];
  officialSourceUrl: string;
  adviceBoundary: string;
};

export function buildInitialTasks(profile: BusinessProfile): GeneratedTask[] {
  const now = new Date();
  const tasks: GeneratedTask[] = [
    {
      title: "Keep records of money coming in",
      plainEnglishSummary:
        "Write down each sale so you can see what your business has earned.",
      dueDate: endOfMonth(now),
      urgency: "NORMAL",
      whatYouNeed: ["Sales notes", "Invoices or payment records", "Bank payments"],
      checklist: [
        "Add each sale for this month.",
        "Keep a copy of any invoice you sent.",
        "Check that the money reached your bank account."
      ],
      officialSourceUrl: "https://www.gov.uk/become-sole-trader",
      adviceBoundary: plainCopy.adviceBoundary
    },
    {
      title: "Keep receipts for business costs",
      plainEnglishSummary:
        "Save proof of business spending so you can explain your costs later.",
      dueDate: endOfMonth(now),
      urgency: "NORMAL",
      whatYouNeed: ["Receipts", "Supplier emails", "Bank payments"],
      checklist: [
        "Save receipts in one place.",
        "Add a short note if the receipt is not obvious.",
        "Mark anything missing so you can find it later."
      ],
      officialSourceUrl: "https://www.gov.uk/become-sole-trader",
      adviceBoundary: plainCopy.adviceBoundary
    },
    {
      title: "Check whether VAT registration may be needed",
      plainEnglishSummary:
        "VAT registration can become compulsory when sales reach the official level set by HMRC.",
      dueDate: addMonths(now, 1),
      urgency: profile.registeredForVat === "NOT_SURE" ? "HIGH" : "NORMAL",
      whatYouNeed: ["Total sales for the last 12 months", "Expected sales for the next 30 days"],
      checklist: [
        "Add up sales for the last 12 months.",
        "Check any large sales expected soon.",
        "Read the official HMRC guidance or ask an accountant if you are unsure."
      ],
      officialSourceUrl: "https://www.gov.uk/register-for-vat",
      adviceBoundary: plainCopy.adviceBoundary
    }
  ];

  if (profile.businessType === "SOLE_TRADER") {
    tasks.push({
      title: "Prepare for Self Assessment",
      plainEnglishSummary:
        "Self Assessment is how many sole traders tell HMRC about business income.",
      dueDate: addMonths(now, 2),
      urgency: "NORMAL",
      whatYouNeed: ["Sales total", "Business costs", "Personal details for HMRC"],
      checklist: [
        "Keep sales and costs up to date.",
        "Save any HMRC letters.",
        "Check the official guidance before submitting anything."
      ],
      officialSourceUrl: "https://www.gov.uk/become-sole-trader",
      adviceBoundary: plainCopy.adviceBoundary
    });
  }

  if (profile.businessType === "LIMITED_COMPANY") {
    tasks.push(
      {
        title: "Prepare company accounts",
        plainEnglishSummary:
          "Your company needs yearly accounts that explain what happened with its money.",
        dueDate: addMonths(profile.companyRegisteredOn ?? now, 9),
        urgency: "HIGH",
        whatYouNeed: ["Sales records", "Business cost records", "Bank statements"],
        checklist: [
          "Check your records are complete.",
          "Collect bank statements.",
          "Ask your accountant what they need if you use one."
        ],
        officialSourceUrl: "https://www.gov.uk/running-a-limited-company",
        adviceBoundary: plainCopy.adviceBoundary
      },
      {
        title: "Confirm your company details",
        plainEnglishSummary:
          "This tells Companies House that your company information is still correct.",
        dueDate: addMonths(profile.companyRegisteredOn ?? now, 12),
        urgency: "NORMAL",
        whatYouNeed: ["Companies House sign-in", "Company number", "Company details"],
        checklist: [
          "Check your company address and director details.",
          "Update anything that has changed.",
          "File the confirmation statement with Companies House."
        ],
        officialSourceUrl:
          "https://www.gov.uk/file-your-confirmation-statement-with-companies-house",
        adviceBoundary: plainCopy.adviceBoundary
      }
    );
  }

  if (profile.worksAlone === "NO") {
    tasks.push({
      title: "Keep records for people you pay",
      plainEnglishSummary:
        "If you employ people, you need clear records of what you pay them.",
      dueDate: endOfMonth(now),
      urgency: "HIGH",
      whatYouNeed: ["Employee details", "Pay records", "Payment dates"],
      checklist: [
        "Keep a record of each payment.",
        "Check what HMRC expects before running payroll.",
        "Ask for professional help if you are unsure."
      ],
      officialSourceUrl: "https://www.gov.uk/employing-staff",
      adviceBoundary: plainCopy.adviceBoundary
    });
  }

  return tasks;
}
