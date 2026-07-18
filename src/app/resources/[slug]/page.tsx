import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl, siteConfig } from "@/config/site";
import { getGuide, resourceGuides, resourcePath, resourceUrl } from "@/content/resources";
import { createPageMetadata, jsonLd } from "@/lib/seo";
import {
  Callout,
  CTASection,
  DeadlineBox,
  FAQSection,
  GuideHeader,
  GuideSection,
  OfficialSourceCard,
  PenaltyBox,
  RelatedGuides
} from "@/components/resource-guide";
import { PublicPage } from "@/components/public-page";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return resourceGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  return createPageMetadata({
    title: guide.title,
    description: guide.description,
    path: resourcePath(guide.slug),
    type: "article"
  });
}

export default async function ResourceGuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${resourceUrl(guide.slug)}#article`,
      headline: guide.h1,
      description: guide.description,
      url: resourceUrl(guide.slug),
      dateModified: "2026-07-18",
      datePublished: "2026-07-18",
      author: {
        "@type": "Organization",
        name: "Business Sorted editorial team",
        url: absoluteUrl("/about")
      },
      publisher: {
        "@id": `${siteConfig.url}/#organization`
      },
      mainEntityOfPage: {
        "@id": `${resourceUrl(guide.slug)}#webpage`
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Resources", item: absoluteUrl("/resources") },
        { "@type": "ListItem", position: 3, name: guide.shortTitle, item: resourceUrl(guide.slug) }
      ]
    },
    {
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
    }
  ];

  return (
    <PublicPage>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <article className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <GuideHeader guide={guide} />

          <Callout>
            Business Sorted is not HMRC, Companies House, an accountant or a legal adviser. Use this
            guide to understand the topic, then check the official source and get professional advice
            when your situation needs it.
          </Callout>

          <GuideSection title="What it is">
            <p>{guide.sections[0]?.[1]}</p>
          </GuideSection>

          <GuideSection title="Who it applies to">
            <p>{guide.appliesTo}</p>
          </GuideSection>

          <GuideSection title="When it applies">
            <p>{guide.whenApplies}</p>
          </GuideSection>

          <DeadlineBox deadlines={guide.deadlines} />

          <GuideSection title="Common mistakes">
            <ul className="space-y-3">
              {guide.mistakes.map((mistake) => (
                <li key={mistake} className="flex gap-2">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </GuideSection>

          <PenaltyBox>{guide.penalties}</PenaltyBox>

          {guide.sections
            .slice(1)
            .filter(([heading]) => !["Who it applies to", "When it applies"].includes(heading))
            .map(([heading, body]) => (
              <GuideSection key={heading} title={heading}>
                <p>{body}</p>
              </GuideSection>
            ))}

          <FAQSection faqs={guide.faqs} />
          <RelatedGuides slugs={guide.related} />
          <CTASection />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
          <OfficialSourceCard sources={guide.officialSources} />
          <Callout>
            Reviewed against official HMRC and Companies House terminology on {guide.reviewed}. See
            the <a href="/how-we-research" className="text-primary underline">research process</a>.
          </Callout>
        </aside>
      </article>
    </PublicPage>
  );
}
