import type { Metadata } from "next";
import Link from "next/link";
import { downloadableResources, downloadPath } from "@/content/authority";
import { guides } from "@/content/seo-content";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "Business compliance checklist UK",
  description: "Plain-English UK business compliance checklists for first-time directors, limited companies, sole traders and small-business admin.",
  path: "/checklists"
});

const checklistGuides = [
  "first-year-limited-company-checklist-uk",
  "small-business-administration-checklist",
  "sole-trader-tax-and-record-keeping-checklist"
].map((slug) => guides.find((guide) => guide.slug === slug)).filter(Boolean);

export default function ChecklistsPage() {
  return (
    <PublicPage>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Checklists", path: "/checklists" }])} />
      <section className="max-w-3xl">
        <Badge variant="calm">Checklists</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">Business compliance checklist UK</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Practical checklists for UK owners who need to organise filings, tax reminders, records and recurring admin without wading through jargon.
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {checklistGuides.map((guide) => (
          <Card key={guide!.slug}>
            <CardHeader>
              <CardTitle className="text-base">{guide!.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <ul className="space-y-2">
                {guide!.checklist.slice(0, 4).map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
              <Link href={`/guides/${guide!.category}/${guide!.slug}`} className="font-medium text-primary underline">
                Open the {guide!.primaryKeyword} checklist
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10 rounded-md border bg-secondary/30 p-5">
        <h2 className="text-2xl font-semibold tracking-normal">Build a checklist around your business</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Your structure matters. A sole trader, a new limited company and a VAT-registered employer can have different recurring tasks.
        </p>
        <Button asChild className="mt-5">
          <Link href="/register">Build my personalised business checklist</Link>
        </Button>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {downloadableResources.map((download) => (
          <Card key={download.slug}>
            <CardHeader>
              <CardTitle className="text-base">{download.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>{download.description}</p>
              <Link href={downloadPath(download.slug)} className="font-medium text-primary underline">
                Download printable PDF
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </PublicPage>
  );
}
