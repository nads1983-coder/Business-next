import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getIndexableResourceArticles,
  getResourceArticle,
  resourceCategories,
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
  TableOfContents
} from "@/components/resource-guide";
import { PublicPage } from "@/components/public-page";
import { ResourceViewTracker } from "@/components/resource-analytics";
import { resourceAnalyticsEvents } from "@/lib/resource-analytics";

type ResourceArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getIndexableResourceArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ResourceArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getResourceArticle(slug);
  if (!article || article.status !== "published") return {};

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
  if (!article || article.status !== "published") notFound();

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
