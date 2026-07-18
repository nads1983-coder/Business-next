import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { downloadableResources, downloadPath } from "@/content/authority";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "Printable UK business checklists",
  description:
    "Download printable Business Sorted checklists for business deadlines, Companies House preparation and VAT registration planning.",
  path: "/downloads"
});

export default function DownloadsPage() {
  return (
    <PublicPage>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Downloads", path: "/downloads" }])} />
      <section className="max-w-3xl">
        <Badge variant="calm">Downloads</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">Printable UK business checklists</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Practical PDFs generated from the same checklist data used across Business Sorted. Use them to prepare questions and reminders before checking official accounts.
        </p>
      </section>
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {downloadableResources.map((download) => (
          <Card key={download.slug}>
            <CardHeader>
              <CardTitle className="text-lg">{download.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">{download.description}</p>
              <Link href={downloadPath(download.slug)} className="inline-flex items-center gap-2 text-sm font-medium text-primary underline">
                Download PDF <Download className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </PublicPage>
  );
}
