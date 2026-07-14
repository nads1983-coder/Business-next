import { ComingSoonPage } from "@/components/coming-soon-page";
import { requireProductAccess } from "@/lib/billing";

export default async function MoneyPage() {
  await requireProductAccess();
  return (
    <ComingSoonPage
      title="Money"
      description="Simple sales, business cost and tax-saving tools will live here."
      items={[
        "Sales and business cost entry",
        "Estimated amount to put aside",
        "Missing-information checks",
        "Bookkeeping reminders"
      ]}
    />
  );
}
