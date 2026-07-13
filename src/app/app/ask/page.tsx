import { ComingSoonPage } from "@/components/coming-soon-page";

export default function AskPage() {
  return (
    <ComingSoonPage
      title="Ask"
      description="A plain-English assistant for general UK business administration."
      items={[
        "Answers with approved official sources",
        "Clear limits around tax and legal advice",
        "Follow-up questions when business type matters",
        "No invented deadlines, rules or thresholds"
      ]}
    />
  );
}
