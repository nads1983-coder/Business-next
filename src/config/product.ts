import {
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  ListChecks,
  ShieldCheck,
  Settings
} from "lucide-react";

export const productConfig = {
  name: "Business Sorted",
  domain: "BusinessSorted.uk",
  legalOperator: "Nadine Pierre Ltd",
  tradingNameDisclosure:
    "BusinessSorted.uk is a trading name of Nadine Pierre Ltd. All services provided through BusinessSorted.uk are operated by Nadine Pierre Ltd, a company registered in England and Wales.",
  promise:
    "What needs doing, when it needs doing, and what it means in plain English.",
  disclaimer:
    "Business Sorted helps you understand and organise your responsibilities. It does not replace advice from a qualified accountant, tax adviser or legal professional.",
  supportEmail: "support@businesssorted.uk",
  plans: {
    free: {
      name: "Free",
      limits: {
        aiQuestionsPerMonth: 0,
        businesses: 1
      }
    },
    starter: {
      name: "Starter",
      limits: {
        aiQuestionsPerMonth: 20,
        businesses: 1
      }
    },
    pro: {
      name: "Pro",
      limits: {
        aiQuestionsPerMonth: "fair-use",
        businesses: "multiple"
      }
    }
  },
  navigation: [
    { label: "Home", href: "/app", icon: Home },
    { label: "My tasks", href: "/app/tasks", icon: ListChecks },
    { label: "Money", href: "/app/money", icon: CircleDollarSign, status: "Coming soon" },
    { label: "Documents", href: "/app/documents", icon: FileText },
    { label: "Ask", href: "/app/ask", icon: HelpCircle, status: "Coming soon" },
    { label: "Calendar", href: "/app/calendar", icon: CalendarDays, status: "Coming soon" },
    { label: "Billing", href: "/app/billing", icon: CreditCard },
    { label: "Settings", href: "/app/settings", icon: Settings },
    { label: "Admin", href: "/app/admin", icon: ShieldCheck, adminOnly: true }
  ]
} as const;
