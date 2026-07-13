import { ComingSoonPage } from "@/components/coming-soon-page";

export default function CalendarPage() {
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
