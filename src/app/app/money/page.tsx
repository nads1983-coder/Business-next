import { ComingSoonPage } from "@/components/coming-soon-page";

export default function MoneyPage() {
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
