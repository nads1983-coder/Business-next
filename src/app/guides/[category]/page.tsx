import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabels, guideHubs, guidesForCategory } from "@/content/seo-content";
import type { Guide } from "@/content/seo-content";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Params = Promise<{ category: Guide["category"] }>;

export function generateStaticParams() {
  return Object.keys(categoryLabels).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  const hub = guideHubs.find((item) => item.path === `/guides/${category}`);
  if (!hub) {
    return {};
  }

  return pageMetadata({
    title: hub.title,
    description: hub.description,
    path: hub.path
  });
}

export default async function GuideCategoryPage({ params }: { params: Params }) {
  const { category } = await params;
  const hub = guideHubs.find((item) => item.path === `/guides/${category}`);
  const categoryGuides = guidesForCategory(category);

  if (!hub || categoryGuides.length === 0) {
    notFound();
  }

  return (
    <PublicPage>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: hub.title, path: hub.path }
        ])}
      />
      <section className="max-w-3xl">
        <Badge variant="calm">{categoryLabels[category]}</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">{hub.title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{hub.description}</p>
        <p className="mt-3 text-sm text-muted-foreground">Primary search theme: {hub.primaryKeyword}.</p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {categoryGuides.map((guide) => (
          <Card key={guide.slug}>
            <CardHeader>
              <CardTitle className="text-base">{guide.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>{guide.summary}</p>
              <p>Best for: {guide.intent}</p>
              <Link href={`/guides/${guide.category}/${guide.slug}`} className="font-medium text-primary underline">
                Read the {guide.primaryKeyword} guide
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </PublicPage>
  );
}
