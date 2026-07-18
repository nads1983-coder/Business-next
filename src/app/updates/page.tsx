import type { Metadata } from "next";
import Link from "next/link";
import { monthlyUpdates, topicClusters } from "@/content/authority";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "UK business compliance updates",
  description:
    "Business Sorted freshness hub for monthly compliance updates, HMRC checks, Companies House changes and topic clusters for first-time owners.",
  path: "/updates"
});

export default function UpdatesPage() {
  return (
    <PublicPage>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Updates", path: "/updates" }])} />
      <section className="max-w-3xl">
        <Badge variant="calm">Freshness hub</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">UK business compliance updates</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          A source-led update hub for Business Sorted guidance. We only treat changes as actionable when they can be checked against official HMRC, Companies House or GOV.UK pages.
        </p>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {monthlyUpdates.map((update) => (
            <Card key={update.slug}>
              <CardHeader>
                <CardTitle>{update.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <p>{update.summary}</p>
                <p>Last reviewed: {update.checked}</p>
                <ul className="space-y-2">
                  {update.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <aside className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-normal">Topic clusters</h2>
          {topicClusters.map((cluster) => (
            <Card key={cluster.name}>
              <CardHeader>
                <CardTitle className="text-lg">{cluster.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-6 text-muted-foreground">{cluster.description}</p>
                <ul className="space-y-2 text-sm">
                  {cluster.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-primary underline">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </aside>
      </section>
    </PublicPage>
  );
}
