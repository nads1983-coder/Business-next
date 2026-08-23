import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getIndexableResourceArticles,
  getResourceArticlesByCategory,
  getResourceArticle,
  resourceCategories,
  resourceCategoryPath,
  resourcePath,
  resourceUrl
} from "@/content/resources";
import { JsonLd, absoluteUrl, breadcrumbSchema, createPageMetadata } from "@/lib/seo";
import {
  ArticleHeader,
  ArticleSection,
  CTASection,
  DirectAnswer,
  FAQSection,
  InformationDisclaimer,
  InternalLinks,
  KeyFacts,
  OfficialSourceCard,
  RelatedGuides,
  Breadcrumbs,
  ResourceCard,
  TableOfContents
} from "@/components/resource-guide";
import { PublicPage } from "@/components/public-page";
import { ResourceViewTracker } from "@/components/resource-analytics";
import { resourceAnalyticsEvents } from "@/lib/resource-analytics";
import { Badge } from "@/components/ui/badge";

type ResourceArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [
    ...getIndexableResourceArticles().map((article) => ({ slug: article.slug })),
    { slug: "hmrc" }
  ];
}

export async function generateMetadata({ params }: ResourceArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getResourceArticle(slug);
  if (!article || article.status !== "published") {
    if (slug in resourceCategories && slug !== "companies-house") {
      const category = resourceCategories[slug as keyof typeof resourceCategories];
      return createPageMetadata({
        title: `${category.label} resources`,
        description: category.description,
        path: resourceCategoryPath(slug as keyof typeof resourceCategories)
      });
    }
    return {};
  }

  return createPageMetadata({
    title: article.socialTitle,
    description: article.socialDescription,
    path: resourcePath(article.slug),
    type: "article",
    noIndex: article.robots === "noindex"
  });
}

export default async function ResourceArticlePage({ params }: ResourceArticlePageProps) {
  const { slug } = await params;
  const article = getResourceArticle(slug);
  if (!article || article.status !== "published") {
    if (slug in resourceCategories && slug !== "companies-house") {
      return <ResourceCategoryPage categorySlug={slug as keyof typeof resourceCategories} />;
    }
    notFound();
  }

  const category = resourceCategories[article.category];
  const faqSchema =
    article.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer
            }
          }))
        }
      : null;

  const structuredData = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Resources", path: "/resources" },
      { name: category.label, path: `/resources/${article.category}` },
      { name: article.title, path: resourcePath(article.slug) }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${resourceUrl(article.slug)}#article`,
      headline: article.title,
      description: article.description,
      url: resourceUrl(article.slug),
      datePublished: article.lastReviewedDate,
      dateModified: article.lastReviewedDate,
      author: {
        "@type": "Organization",
        name: article.author,
        url: absoluteUrl("/about")
      },
      publisher: {
        "@type": "Organization",
        name: "Business Sorted",
        url: absoluteUrl("/")
      },
      mainEntityOfPage: resourceUrl(article.slug),
      articleSection: category.label,
      keywords: [article.primaryKeyword, ...article.secondaryKeywords]
    },
    ...(faqSchema ? [faqSchema] : [])
  ];

  return (
    <PublicPage>
      <JsonLd data={structuredData} />
      <ResourceViewTracker
        eventName={resourceAnalyticsEvents.resourceArticleViewed}
        eventKey={`article:${article.slug}`}
        props={{
          article_slug: article.slug,
          article_category: article.category,
          article_group: article.cluster
        }}
      />
      <article className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <ArticleHeader article={article} />
          <InformationDisclaimer />
          <DirectAnswer article={article} />
          <KeyFacts facts={article.keyFacts} />
          {article.content.map((section) => (
            <ArticleSection key={section.id} section={section} />
          ))}
          <FAQSection faqs={article.faqs} />
          <RelatedGuides article={article} />
          <InternalLinks article={article} />
          <CTASection article={article} />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
          <TableOfContents article={article} />
          <OfficialSourceCard article={article} />
        </aside>
      </article>
    </PublicPage>
  );
}

function ResourceCategoryPage({ categorySlug }: { categorySlug: keyof typeof resourceCategories }) {
  const category = resourceCategories[categorySlug];
  const articles = getResourceArticlesByCategory(categorySlug);

  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
            { name: category.label, path: resourceCategoryPath(categorySlug) }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${absoluteUrl(resourceCategoryPath(categorySlug))}#webpage`,
            url: absoluteUrl(resourceCategoryPath(categorySlug)),
            name: `${category.label} resources`,
            description: category.description
          }
        ]}
      />
      <ResourceViewTracker
        eventName={resourceAnalyticsEvents.resourceCategoryViewed}
        eventKey={`resource-category:${categorySlug}`}
        props={{ category: categorySlug }}
      />
      <div className="space-y-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Resources", href: "/resources" },
            { label: category.label }
          ]}
        />
        <header className="max-w-3xl">
          <Badge variant="calm">{category.label}</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">{category.label} resources</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">{category.introduction}</p>
        </header>
        <section className="grid gap-4 md:grid-cols-2">
          {articles.map((categoryArticle) => (
            <ResourceCard key={categoryArticle.slug} article={categoryArticle} />
          ))}
        </section>
      </div>
    </PublicPage>
  );
}
