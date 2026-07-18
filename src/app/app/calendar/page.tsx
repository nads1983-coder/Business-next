import { ComingSoonPage } from "@/components/coming-soon-page";
import { requireProductAccess } from "@/lib/billing";

export default async function CalendarPage() {
  await requireProductAccess();
  return (
    <ComingSoonPage
      title="Calendar view is coming soon"
      description="This area will provide a visual view of upcoming deadlines and tasks."
      value="For now, your dashboard and task list show what needs attention first, what is coming up, and what has already been handled."
      items={[
        "See deadlines and tasks in a date-led view",
        "Spot due today, tomorrow and upcoming work more quickly",
        "Move from a calendar item back to the full task detail",
        "Keep reminder settings connected to your business profile"
      ]}
      actionHref="/app"
      actionLabel="Back to dashboard"
    />
  );
}
