import { ComingSoonPage } from "@/components/coming-soon-page";
import { requireProductAccess } from "@/lib/billing";

export default async function DocumentsPage() {
  await requireProductAccess();
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
