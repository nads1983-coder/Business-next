import type { Metadata } from "next";
import Link from "next/link";
import { guideHubs, guides, keywordMap } from "@/content/seo-content";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = pageMetadata({
  title: "UK small-business admin guides",
  description: "Plain-English UK guides for Companies House, HMRC, limited company, sole trader and small-business admin deadlines.",
  path: "/guides"
});

export default function GuidesPage() {
  return (
    <PublicPage>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }])} />
      <section className="max-w-3xl">
        <Badge variant="calm">Guides</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">UK small-business admin guides</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Direct, source-linked explainers for founders, directors, freelancers and sole traders who need to understand filing deadlines, tax reminders and recurring paperwork.
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {guideHubs.map((hub) => (
          <Card key={hub.path}>
            <CardHeader>
              <CardTitle className="text-xl">{hub.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>{hub.description}</p>
              <p>Primary theme: {hub.primaryKeyword}.</p>
              <Link href={hub.path} className="font-medium text-primary underline">
                Browse {hub.title.toLowerCase()}
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-normal">Cornerstone guides</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {guides.map((guide) => (
            <Card key={guide.slug}>
              <CardHeader>
                <CardTitle className="text-base">{guide.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>{guide.description}</p>
                <p>Search intent: {guide.intent}</p>
                <Link href={`/guides/${guide.category}/${guide.slug}`} className="font-medium text-primary underline">
                  Read the {guide.primaryKeyword} guide
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-md border bg-secondary/30 p-5">
        <h2 className="text-xl font-semibold tracking-normal">Search-intent map</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="border-b py-2 pr-4 font-medium">Route</th>
                <th className="border-b py-2 pr-4 font-medium">Primary theme</th>
                <th className="border-b py-2 pr-4 font-medium">Conversion goal</th>
              </tr>
            </thead>
            <tbody>
              {keywordMap.slice(0, 12).map((item) => (
                <tr key={item.route}>
                  <td className="border-b py-2 pr-4">{item.route}</td>
                  <td className="border-b py-2 pr-4">{item.primary}</td>
                  <td className="border-b py-2 pr-4">{item.conversion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PublicPage>
  );
}
