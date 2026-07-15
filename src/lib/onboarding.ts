import { z } from "zod";

export const onboardingQuestions = [
  {
    id: "businessType",
    label: "What type of business do you have?",
    help: "This decides which official deadlines Business Sorted can calculate.",
    type: "choice",
    options: [
      { value: "SOLE_TRADER", label: "Sole trader" },
      { value: "LIMITED_COMPANY", label: "Limited company" },
      { value: "NOT_SURE", label: "I am not sure" }
    ]
  },
  {
    id: "legalBusinessName",
    label: "What is the legal business name?",
    help: "This helps you recognise which business the tasks belong to. You can change it later.",
    type: "text"
  },
  {
    id: "tradingName",
    label: "Do you use a different trading name?",
    help: "Only add this if customers know you by a different name.",
    type: "text",
    optional: true
  },
  {
    id: "companyNumber",
    label: "What is the company number?",
    help: "Companies House uses this to identify a limited company. It is usually 8 characters.",
    type: "text",
    businessTypes: ["LIMITED_COMPANY"]
  },
  {
    id: "companyRegisteredOn",
    label: "When was the company incorporated?",
    help: "This date is needed for first accounts and the first confirmation statement.",
    type: "date",
    businessTypes: ["LIMITED_COMPANY"]
  },
  {
    id: "startedTradingOn",
    label: "When did trading start?",
    help: "This is the first date you started selling or doing paid work. It helps calculate tax-year deadlines.",
    type: "date"
  },
  {
    id: "firstAccountingPeriodEnd",
    label: "When does the first accounting period end?",
    help: "For limited companies, this helps calculate Corporation Tax and Company Tax Return dates. Leave blank if you are not sure.",
    type: "date",
    optional: true,
    businessTypes: ["LIMITED_COMPANY"]
  },
  {
    id: "businessYearEndMonth",
    label: "What month does the business year end?",
    help: "If you do not know the exact date, the month still helps Business Sorted avoid guessing.",
    type: "month"
  },
  {
    id: "registeredForVat",
    label: "Are you registered for VAT?",
    help: "VAT registration adds VAT Return tasks.",
    type: "choice",
    options: [
      { value: "YES", label: "Yes" },
      { value: "NO", label: "No" },
      { value: "NOT_SURE", label: "I am not sure" }
    ]
  },
  {
    id: "vatRegisteredOn",
    label: "When did VAT registration start?",
    help: "This helps explain VAT tasks. You can find it in your VAT online account.",
    type: "date",
    optional: true,
    requires: { id: "registeredForVat", value: "YES" }
  },
  {
    id: "vatPeriodEndsOn",
    label: "When does the current VAT accounting period end?",
    help: "VAT Returns are usually due from the end of the VAT period.",
    type: "date",
    requires: { id: "registeredForVat", value: "YES" }
  },
  {
    id: "employsPeople",
    label: "Do you employ anyone or pay yourself through payroll?",
    help: "Choose yes if PAYE may apply. Freelancers and suppliers usually do not count as employees.",
    type: "choice",
    options: [
      { value: "YES", label: "Yes" },
      { value: "NO", label: "No" },
      { value: "NOT_SURE", label: "I am not sure" }
    ]
  },
  {
    id: "firstPayday",
    label: "When is the first payday?",
    help: "HMRC says employer registration is needed before the first payday. Leave blank if you are not sure yet.",
    type: "date",
    optional: true,
    requires: { id: "employsPeople", value: "YES" }
  },
  {
    id: "usesAccountant",
    label: "Do you use an accountant?",
    help: "This does not change your deadlines, but helps us phrase guidance sensibly.",
    type: "choice",
    options: [
      { value: "YES", label: "Yes" },
      { value: "NO", label: "No" },
      { value: "NOT_SURE", label: "I am not sure" }
    ]
  },
  {
    id: "wantsEmailReminders",
    label: "Would you like deadline reminders by email?",
    help: "You can turn non-essential deadline reminders off later. Account and security emails are separate.",
    type: "choice",
    options: [
      { value: "YES", label: "Yes" },
      { value: "NO", label: "No" }
    ]
  },
  {
    id: "salesSoFar",
    label: "How much have you sold so far this year?",
    help: "A rough number is enough for planning. This is not sent to HMRC.",
    type: "money"
  },
  {
    id: "costsSoFar",
    label: "Roughly how much have you spent on the business?",
    help: "Include business costs like software, equipment, travel or supplies.",
    type: "money"
  },
  {
    id: "canUpdateLater",
    label: "You can update these details later",
    help: "Changing important dates may change your deadline list. Business Sorted will show the effect before saving in Settings.",
    type: "choice",
    options: [{ value: "YES", label: "I understand" }]
  }
] as const;

const optionalDate = z.string().optional();

export const onboardingSchema = z
  .object({
    businessType: z.enum(["SOLE_TRADER", "LIMITED_COMPANY", "NOT_SURE"]),
    legalBusinessName: z.string().trim().min(1, "Add a business name").max(120),
    tradingName: z.string().trim().max(120).optional(),
    companyNumber: z.string().trim().max(8).optional(),
    startedTradingOn: optionalDate,
    companyRegisteredOn: optionalDate,
    firstAccountingPeriodEnd: optionalDate,
    businessYearEndMonth: z.coerce.number().min(1).max(12).optional(),
    registeredForVat: z.enum(["YES", "NO", "NOT_SURE"]),
    vatRegisteredOn: optionalDate,
    vatPeriodEndsOn: optionalDate,
    employsPeople: z.enum(["YES", "NO", "NOT_SURE"]),
    firstPayday: optionalDate,
    usesAccountant: z.enum(["YES", "NO", "NOT_SURE"]),
    wantsEmailReminders: z.enum(["YES", "NO"]),
    salesSoFar: z.coerce.number().min(0).default(0),
    costsSoFar: z.coerce.number().min(0).default(0),
    canUpdateLater: z.literal("YES")
  })
  .superRefine((data, ctx) => {
    if (data.businessType === "LIMITED_COMPANY") {
      if (data.companyNumber && !/^[A-Za-z0-9]{8}$/.test(data.companyNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companyNumber"],
          message: "Company numbers are usually 8 letters or numbers."
        });
      }
    }
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;
