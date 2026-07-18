import { ComingSoonPage } from "@/components/coming-soon-page";
import { requireProductAccess } from "@/lib/billing";

export default async function MoneyPage() {
  await requireProductAccess();
  return (
    <ComingSoonPage
      title="Money tools are coming soon"
      description="This area is planned to help you understand upcoming financial obligations and keep relevant business dates organised."
      value="For now, use your task list and business settings to keep deadline information current."
      items={[
        "Track the business dates that affect money decisions",
        "See what information may be needed before tax-related tasks",
        "Keep bookkeeping and payment reminders close to the rest of your admin",
        "Maintain plain-English boundaries around financial guidance"
      ]}
      actionHref="/app/tasks"
      actionLabel="Review my tasks"
    />
  );
}
