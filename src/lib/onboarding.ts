import { z } from "zod";

export const onboardingQuestions = [
  {
    id: "businessType",
    label: "What type of business do you have?",
    help: "Choose the option that sounds closest. If you are not sure, that is okay.",
    type: "choice",
    options: [
      { value: "SOLE_TRADER", label: "Sole trader" },
      { value: "LIMITED_COMPANY", label: "Limited company" },
      { value: "NOT_SURE", label: "I am not sure" }
    ]
  },
  {
    id: "worksAlone",
    label: "Are you working by yourself?",
    help: "If you pay anyone as an employee, choose no. Freelancers and suppliers usually do not count as employees.",
    type: "choice",
    options: [
      { value: "YES", label: "Yes" },
      { value: "NO", label: "No" },
      { value: "NOT_SURE", label: "I am not sure" }
    ]
  },
  {
    id: "startedTradingOn",
    label: "When did you start selling or doing paid work?",
    help: "This is the first date you started trading, not the date you first had the idea.",
    type: "date"
  },
  {
    id: "companyRegisteredOn",
    label: "If you have a limited company, when was it registered?",
    help: "You can find this on your Companies House registration email or company record.",
    type: "date",
    optional: true
  },
  {
    id: "paysSelfThroughCompany",
    label: "Do you pay yourself through the company?",
    help: "This might mean paying yourself wages or taking money from company profits.",
    type: "choice",
    options: [
      { value: "YES", label: "Yes" },
      { value: "NO", label: "No" },
      { value: "NOT_SURE", label: "I am not sure" }
    ]
  },
  {
    id: "registeredForVat",
    label: "Are you registered for VAT?",
    help: "VAT is a tax added to some sales. Most very small businesses are not registered when they first start.",
    type: "choice",
    options: [
      { value: "YES", label: "Yes" },
      { value: "NO", label: "No" },
      { value: "NOT_SURE", label: "I am not sure" }
    ]
  },
  {
    id: "usesAccountant",
    label: "Do you use an accountant?",
    help: "Choose yes if someone helps you prepare accounts, tax returns or official filings.",
    type: "choice",
    options: [
      { value: "YES", label: "Yes" },
      { value: "NO", label: "No" },
      { value: "NOT_SURE", label: "I am not sure" }
    ]
  },
  {
    id: "businessYearEndMonth",
    label: "What month does your business year end?",
    help: "If you do not know, choose the closest month or leave it as not sure later.",
    type: "month"
  },
  {
    id: "wantsEmailReminders",
    label: "Would you like reminders by email?",
    help: "You can pause reminders at any time.",
    type: "choice",
    options: [
      { value: "YES", label: "Yes" },
      { value: "NO", label: "No" }
    ]
  },
  {
    id: "salesSoFar",
    label: "How much have you sold so far this year?",
    help: "A rough number is enough for now. This helps us spot tasks that may need your attention.",
    type: "money"
  },
  {
    id: "costsSoFar",
    label: "Roughly how much have you spent on the business?",
    help: "Include business costs like software, equipment, travel or supplies.",
    type: "money"
  }
] as const;

export const onboardingSchema = z.object({
  businessType: z.enum(["SOLE_TRADER", "LIMITED_COMPANY", "NOT_SURE"]),
  worksAlone: z.enum(["YES", "NO", "NOT_SURE"]),
  startedTradingOn: z.string().optional(),
  companyRegisteredOn: z.string().optional(),
  paysSelfThroughCompany: z.enum(["YES", "NO", "NOT_SURE"]),
  registeredForVat: z.enum(["YES", "NO", "NOT_SURE"]),
  usesAccountant: z.enum(["YES", "NO", "NOT_SURE"]),
  businessYearEndMonth: z.coerce.number().min(1).max(12).optional(),
  wantsEmailReminders: z.enum(["YES", "NO"]),
  salesSoFar: z.coerce.number().min(0).default(0),
  costsSoFar: z.coerce.number().min(0).default(0)
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
