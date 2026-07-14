import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  HelpCircle,
  Home,
  ListChecks,
  ShieldCheck,
  Settings
} from "lucide-react";

export const productConfig = {
  name: "Business Next",
  promise:
    "What needs doing, when it needs doing, and what it means in plain English.",
  disclaimer:
    "Business Next helps you understand and organise your responsibilities. It does not replace advice from a qualified accountant, tax adviser or legal professional.",
  supportEmail: "support@example.com",
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
    { label: "Money", href: "/app/money", icon: CircleDollarSign },
    { label: "Documents", href: "/app/documents", icon: FileText },
    { label: "Ask", href: "/app/ask", icon: HelpCircle },
    { label: "Calendar", href: "/app/calendar", icon: CalendarDays },
    { label: "Settings", href: "/app/settings", icon: Settings },
    { label: "Admin", href: "/app/admin", icon: ShieldCheck, adminOnly: true }
  ]
} as const;
