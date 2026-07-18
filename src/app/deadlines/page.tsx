import type { Metadata } from "next";
import Link from "next/link";
import { guides, lastChecked } from "@/content/seo-content";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = pageMetadata({
  title: "Business deadline calendar UK",
  description: "Track UK limited company, Companies House, HMRC and sole trader deadline reminders in one plain-English business calendar.",
  path: "/deadlines"
});

const deadlineRows = [
  ["First accounts", "Companies House", "Usually 21 months after registration for a private limited company's first accounts."],
  ["Annual accounts", "Companies House", "Usually 9 months after the company's financial year ends."],
  ["Confirmation statement", "Companies House", "Recurring Companies House filing used to confirm company information is accurate."],
  ["Corporation Tax payment", "HMRC", "Usually 9 months and 1 day after the accounting period ends for companies with taxable profits up to GBP 1.5 million."],
  ["Company Tax Return", "HMRC", "Usually 12 months after the end of the accounting period it covers."],
  ["Self Assessment", "HMRC", "For the 2025 to 2026 tax year, online returns and payment are due by 31 January 2027."]
];

export default function DeadlinesPage() {
  const guide = guides.find((item) => item.slug === "uk-limited-company-filing-deadlines");

  return (
    <PublicPage>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Deadlines", path: "/deadlines" }])} />
      <section className="max-w-3xl">
        <Badge variant="calm">Deadlines</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">Business deadline calendar UK</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          A plain-English overview of the Companies House, HMRC and small-business admin dates Business Sorted helps owners organise.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">Last checked: {lastChecked}. Always confirm your own dates in official records.</p>
      </section>

      <section className="mt-10 overflow-x-auto rounded-md border">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="p-3 font-medium">Deadline</th>
              <th className="p-3 font-medium">Body</th>
              <th className="p-3 font-medium">Plain-English note</th>
            </tr>
          </thead>
          <tbody>
            {deadlineRows.map(([deadline, body, note]) => (
              <tr key={deadline}>
                <td className="border-t p-3 font-medium">{deadline}</td>
                <td className="border-t p-3 text-muted-foreground">{body}</td>
                <td className="border-t p-3 text-muted-foreground">{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-10 rounded-md border bg-secondary/30 p-5">
        <h2 className="text-2xl font-semibold tracking-normal">How Business Sorted uses deadlines</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Business Sorted separates filing and payment tasks, attaches official source links, and turns deadlines into reminders and preparation steps.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/register">Keep track of my filing dates</Link>
          </Button>
          {guide ? (
            <Button asChild variant="outline">
              <Link href={`/guides/${guide.category}/${guide.slug}`}>Read the limited company filing deadlines guide</Link>
            </Button>
          ) : null}
        </div>
      </section>
    </PublicPage>
  );
}
