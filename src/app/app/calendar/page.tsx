import { ComingSoonPage } from "@/components/coming-soon-page";
import { requireProductAccess } from "@/lib/billing";

export default async function CalendarPage() {
  await requireProductAccess();
  return (
    <ComingSoonPage
      title="Calendar"
      description="Important business dates in plain English."
      items={[
        "Due soon, coming up, completed, needs information and overdue labels",
        "Official names shown only where helpful",
        "Preparation checklists",
        "Reminder settings"
      ]}
    />
  );
}
