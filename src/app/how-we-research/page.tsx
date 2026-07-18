import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/config/site";
import { createPageMetadata, jsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/resource-guide";
import { PublicPage } from "@/components/public-page";

export const metadata: Metadata = createPageMetadata({
  title: "How Business Sorted Researches Guides",
  description:
    "Learn how Business Sorted researches UK business deadline guides using official HMRC, Companies House and GOV.UK sources.",
  path: "/how-we-research"
});

export default function HowWeResearchPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${absoluteUrl("/how-we-research")}#webpage`,
      url: absoluteUrl("/how-we-research"),
      name: "How Business Sorted Researches Guides",
      isPartOf: { "@id": `${siteConfig.url}/#website` }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        {
          "@type": "ListItem",
          position: 2,
          name: "How we research",
          item: absoluteUrl("/how-we-research")
        }
      ]
    }
  ];

  return (
    <PublicPage narrow>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <div className="space-y-7">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How we research" }]} />
        <header>
          <p className="text-sm font-medium text-primary">Research process</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">
            How Business Sorted researches deadline guides
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Business Sorted turns official terminology into plain-English explanations for first-time
            UK business owners, while keeping source links close to the guidance.
          </p>
        </header>
        <section>
          <h2 className="text-2xl font-semibold tracking-normal">Official sources first</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            We start with GOV.UK, HMRC and Companies House pages for deadline topics. The goal is to
            explain what the duty is, who it may apply to and which official source a reader should check next.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold tracking-normal">Plain-English editing</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Drafts are edited to remove unnecessary jargon, avoid keyword stuffing and make distinctions
            clear, such as the difference between Companies House accounts and HMRC tax returns.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold tracking-normal">Review dates</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Resource pages show when they were reviewed. A review date means the page has been checked
            for clarity and source relevance; it does not mean the page replaces official guidance or professional advice.
          </p>
        </section>
        <nav className="flex flex-wrap gap-4 text-sm text-primary underline">
          <Link href="/resources">Browse resources</Link>
          <Link href="/editorial-policy">Editorial policy</Link>
          <Link href="/about">About Business Sorted</Link>
        </nav>
      </div>
    </PublicPage>
  );
}
