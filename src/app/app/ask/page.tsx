import { ComingSoonPage } from "@/components/coming-soon-page";
import { requireProductAccess } from "@/lib/billing";

export default async function AskPage() {
  await requireProductAccess();
  return (
    <ComingSoonPage
      title="Ask Business Sorted is coming soon"
      description="This area is intended to provide plain-English explanations based on your Business Sorted information."
      value="It will not replace professional legal, accounting or tax advice. Until it is ready, use the task detail pages and official source links for the clearest available guidance."
      items={[
        "Explain tasks using your saved business context",
        "Point back to approved official sources where useful",
        "Ask follow-up questions when business details matter",
        "Keep advice boundaries visible and easy to understand"
      ]}
      actionHref="/app/tasks"
      actionLabel="Open my task list"
    />
  );
}
