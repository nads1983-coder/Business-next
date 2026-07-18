import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { comparisonPath, comparisonResources, getComparison } from "@/content/authority";
import { JsonLd, absoluteUrl, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Breadcrumbs } from "@/components/resource-guide";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ComparisonPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return comparisonResources.map((comparison) => ({ slug: comparison.slug }));
}

export async function generateMetadata({ params }: ComparisonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) return {};

  return pageMetadata({
    title: comparison.title,
    description: comparison.description,
    path: comparisonPath(comparison.slug),
    type: "article"
  });
}

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) notFound();

  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Comparisons", path: "/comparisons" },
            { name: comparison.shortTitle, path: comparisonPath(comparison.slug) }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: comparison.title,
            description: comparison.description,
            url: absoluteUrl(comparisonPath(comparison.slug)),
            author: { "@type": "Organization", name: "Business Sorted editorial team" },
            datePublished: "2026-07-18",
            dateModified: "2026-07-18"
          }
        ]}
      />
      <article className="space-y-10">
        <header className="max-w-3xl space-y-5">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Comparisons", href: "/comparisons" },
              { label: comparison.shortTitle }
            ]}
          />
          <Badge variant="calm">Comparison guide</Badge>
          <h1 className="text-4xl font-semibold tracking-normal">{comparison.title}</h1>
          <p className="text-lg leading-8 text-muted-foreground">{comparison.summary}</p>
          <p className="text-sm text-muted-foreground">
            Reviewed 18 July 2026 · Sources checked: {comparison.sources.map((source) => source.label).join(", ")}
          </p>
        </header>

        <section className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="p-3 font-medium">Factor</th>
                <th className="p-3 font-medium">{comparison.optionA}</th>
                <th className="p-3 font-medium">{comparison.optionB}</th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row) => (
                <tr key={row.factor}>
                  <td className="border-t p-3 font-medium">{row.factor}</td>
                  <td className="border-t p-3 text-muted-foreground">{row.a}</td>
                  <td className="border-t p-3 text-muted-foreground">{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {comparison.fits.map((fit) => (
            <Card key={fit.label}>
              <CardHeader>
                <CardTitle className="text-lg">{fit.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                  {fit.points.map((point) => (
                    <li key={point}>- {point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
            <CardHeader>
              <CardTitle>Common misconceptions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                {comparison.misconceptions.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Official sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {comparison.sources.map((source) => (
                  <li key={source.href}>
                    <a href={source.href} className="text-primary underline" target="_blank" rel="noreferrer">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-normal">Related guides</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {comparison.related.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-md border p-4 text-sm font-medium hover:border-primary/40">
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </article>
    </PublicPage>
  );
}
