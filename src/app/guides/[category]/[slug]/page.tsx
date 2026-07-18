import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabels, findGuide, guides } from "@/content/seo-content";
import type { Guide } from "@/content/seo-content";
import { JsonLd, absoluteUrl, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Params = Promise<{ category: Guide["category"]; slug: string }>;

export function generateStaticParams() {
  return guides.map((guide) => ({
    category: guide.category,
    slug: guide.slug
  }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category, slug } = await params;
  const guide = findGuide(slug);
  if (!guide || guide.category !== category) {
    return {};
  }

  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.category}/${guide.slug}`,
    type: "article"
  });
}

export default async function GuidePage({ params }: { params: Params }) {
  const { category, slug } = await params;
  const guide = findGuide(slug);

  if (!guide || guide.category !== category) {
    notFound();
  }

  const path = `/guides/${guide.category}/${guide.slug}`;
  const relatedGuides = guide.related.map(findGuide).filter(Boolean);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    mainEntityOfPage: absoluteUrl(path),
    dateModified: "2026-07-16",
    datePublished: "2026-07-16",
    author: {
      "@type": "Organization",
      name: "Business Sorted",
      url: "https://businesssorted.uk"
    },
    publisher: {
      "@type": "Organization",
      name: "Business Sorted",
      url: "https://businesssorted.uk"
    },
    about: guide.primaryKeyword
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  return (
    <PublicPage narrow>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: categoryLabels[guide.category], path: `/guides/${guide.category}` },
            { name: guide.title, path }
          ]),
          articleSchema,
          faqSchema
        ]}
      />
      <article className="space-y-8">
        <header>
          <Badge variant="calm">{categoryLabels[guide.category]}</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">{guide.title}</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">{guide.description}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Last checked against official sources: {guide.lastChecked}. General information only, not legal, tax or accounting advice.
          </p>
        </header>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Direct answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>{guide.answer}</p>
            <p>{guide.summary}</p>
          </CardContent>
        </Card>

        {guide.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-semibold tracking-normal">{section.heading}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-2xl font-semibold tracking-normal">Practical checklist</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {guide.checklist.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-normal">Common mistakes</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {guide.mistakes.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-normal">FAQs</h2>
          <div className="mt-4 space-y-4">
            {guide.faqs.map((faq) => (
              <section key={faq.question}>
                <h3 className="text-base font-semibold tracking-normal">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </section>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-normal">Official sources</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {guide.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} className="text-primary underline" rel="noreferrer">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Get your business admin sorted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>{guide.conversionGoal} Business Sorted helps turn this kind of guidance into deadline reminders and plain-English tasks.</p>
            <Button asChild>
              <Link href="/register">Build my personalised business checklist</Link>
            </Button>
          </CardContent>
        </Card>

        {relatedGuides.length > 0 ? (
          <section>
            <h2 className="text-2xl font-semibold tracking-normal">Related guides</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {relatedGuides.map((related) => (
                <li key={related!.slug}>
                  <Link href={`/guides/${related!.category}/${related!.slug}`} className="text-primary underline">
                    {related!.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </PublicPage>
  );
}
