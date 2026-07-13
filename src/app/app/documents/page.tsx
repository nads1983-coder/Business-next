import { ComingSoonPage } from "@/components/coming-soon-page";

export default function DocumentsPage() {
  return (
    <ComingSoonPage
      title="Documents"
      description="Upload, explain and organise HMRC, Companies House and accountant documents."
      items={[
        "Document upload with explicit save consent",
        "Letter and email explanations",
        "Accountant preparation pack",
        "PDF and CSV exports where appropriate"
      ]}
    />
  );
}
