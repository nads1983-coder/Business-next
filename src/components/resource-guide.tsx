import Link from "next/link";
import { ArrowRight, CalendarDays, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import {
  formatResourceDate,
  getRelatedResourceArticles,
  resourceCategories,
  resourceCategoryPath,
  resourceCtaVariants,
  resourcePath,
  type ResourceArticle
} from "@/content/resources";
import { ResourceTrackedLink } from "@/components/resource-analytics";
import { resourceAnalyticsEvents } from "@/lib/resource-analytics";
import { productConfig } from "@/config/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Breadcrumbs({
  items
}: {
  items: readonly { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
            {index < items.length - 1 ? <span aria-hidden="true">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ResourceCard({ article }: { article: ResourceArticle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          <ResourceTrackedLink
            href={resourcePath(article.slug)}
            className="hover:text-primary"
            eventProps={{
              target_slug: article.slug,
              article_category: article.category,
              link_location: "resource_card_title"
            }}
          >
            {article.title}
          </ResourceTrackedLink>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">{article.description}</p>
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          Reviewed {formatResourceDate(article.lastReviewedDate)} · {article.estimatedReadingTime} min read
        </p>
        <ResourceTrackedLink
          href={resourcePath(article.slug)}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary underline"
          eventProps={{
            target_slug: article.slug,
            article_category: article.category,
            link_location: "resource_card_read_guide"
          }}
        >
          Read guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ResourceTrackedLink>
      </CardContent>
    </Card>
  );
}

export function ArticleHeader({ article }: { article: ResourceArticle }) {
  const category = resourceCategories[article.category];

  return (
    <header className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: category.label, href: resourceCategoryPath(article.category) },
          { label: article.title }
        ]}
      />
      <div>
        <Badge variant="calm">{category.label} guide</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">{article.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{article.summary}</p>
      </div>
      <dl className="grid gap-3 rounded-md border bg-secondary/30 p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-medium text-foreground">Last reviewed</dt>
          <dd className="mt-1 text-muted-foreground">{formatResourceDate(article.lastReviewedDate)}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Sources checked</dt>
          <dd className="mt-1 text-muted-foreground">{formatResourceDate(article.sourceCheckedDate)}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Reading time</dt>
          <dd className="mt-1 text-muted-foreground">{article.estimatedReadingTime} minutes</dd>
        </div>
      </dl>
      <p className="text-sm text-muted-foreground">Written by {article.author}</p>
    </header>
  );
}

export function DirectAnswer({ article }: { article: ResourceArticle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Direct answer</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">
        <p>{article.directAnswer}</p>
      </CardContent>
    </Card>
  );
}

export function KeyFacts({ facts }: { facts: readonly string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
          Key facts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          {facts.map((fact) => (
            <li key={fact} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function TableOfContents({ article }: { article: ResourceArticle }) {
  if (article.content.length < 3) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">On this page</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2 text-sm">
          {article.content.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-primary underline">
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export function ArticleSection({ section }: { section: ResourceArticle["content"][number] }) {
  return (
    <section id={section.id} className="scroll-mt-24 space-y-3">
      <h2 className="text-2xl font-semibold tracking-normal">{section.heading}</h2>
      <div className="space-y-4 text-base leading-7 text-muted-foreground">
        {section.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {section.subsections?.map((subsection) => (
          <div key={subsection.heading} className="space-y-2">
            <h3 className="text-lg font-semibold tracking-normal text-foreground">{subsection.heading}</h3>
            {subsection.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function OfficialSourceCard({ article }: { article: ResourceArticle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          Official sources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm">
          {article.officialSources.map((source) => (
            <li key={source.href}>
              <ResourceTrackedLink
                href={source.href}
                className="inline-flex items-center gap-2 text-primary underline"
                rel="noreferrer"
                target="_blank"
                eventName={resourceAnalyticsEvents.resourceSourceClicked}
                eventProps={{
                  article_slug: article.slug,
                  article_category: article.category,
                  link_location: "official_sources"
                }}
              >
                {source.label}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </ResourceTrackedLink>
              <span className="mt-1 block text-xs text-muted-foreground">{source.publisher}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function RelatedGuides({ article }: { article: ResourceArticle }) {
  const related = getRelatedResourceArticles(article);

  if (related.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-normal">Related guides</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {related.map((relatedArticle) => (
          <ResourceTrackedLink
            key={relatedArticle.slug}
            href={resourcePath(relatedArticle.slug)}
            className="rounded-md border bg-card p-4 text-sm hover:border-primary/40"
            eventName={resourceAnalyticsEvents.resourceRelatedArticleClicked}
            eventProps={{
              article_slug: article.slug,
              article_category: article.category,
              target_slug: relatedArticle.slug,
              link_location: "related_guides"
            }}
          >
            <span className="font-medium text-foreground">{relatedArticle.title}</span>
            <span className="mt-2 block text-muted-foreground">{relatedArticle.description}</span>
          </ResourceTrackedLink>
        ))}
      </div>
    </section>
  );
}

export function FAQSection({ faqs }: { faqs: ResourceArticle["faqs"] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-normal">Frequently asked questions</h2>
      <div className="grid gap-4">
        {faqs.map((faq) => (
          <Card key={faq.question}>
            <CardHeader>
              <CardTitle className="text-base">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">{faq.answer}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function InternalLinks({ article }: { article: ResourceArticle }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-normal">Useful next steps</h2>
      <ul className="grid gap-3 text-sm sm:grid-cols-2">
        {article.internalLinks.map((link) => (
          <li key={link.href}>
            <ResourceTrackedLink
              href={link.href}
              className="block rounded-md border p-4 font-medium hover:border-primary/40"
              eventProps={{
                article_slug: article.slug,
                article_category: article.category,
                link_location: "useful_next_steps"
              }}
            >
              {link.label}
            </ResourceTrackedLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function InformationDisclaimer() {
  return (
    <Card className="border-primary/30 bg-secondary/40">
      <CardContent className="flex items-start gap-3 p-4 text-sm leading-6 text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
        <div>
          {productConfig.name} provides general educational information and organisation tools. It is
          not Companies House, HMRC, a solicitor, an accountant, a tax adviser or a regulated
          professional adviser. Check official sources and get professional advice where your
          circumstances need it.
        </div>
      </CardContent>
    </Card>
  );
}

export function CTASection({ article }: { article: ResourceArticle }) {
  const cta = resourceCtaVariants[article.ctaVariant];

  return (
    <section className="rounded-md border bg-secondary/40 p-6">
      <h2 className="text-2xl font-semibold tracking-normal">{cta.title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{cta.body}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Relevant feature: {article.relatedProductFeature}.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <ResourceTrackedLink
            href={cta.primaryHref}
            eventName={resourceAnalyticsEvents.resourceCtaClicked}
            eventProps={{
              article_slug: article.slug,
              article_category: article.category,
              cta_variant: article.ctaVariant,
              link_location: "end_article_primary_cta"
            }}
          >
            {cta.primaryLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ResourceTrackedLink>
        </Button>
        <Button asChild variant="outline">
          <ResourceTrackedLink
            href={cta.secondaryHref}
            eventName={resourceAnalyticsEvents.resourceCtaClicked}
            eventProps={{
              article_slug: article.slug,
              article_category: article.category,
              cta_variant: article.ctaVariant,
              link_location: "end_article_secondary_cta"
            }}
          >
            {cta.secondaryLabel}
          </ResourceTrackedLink>
        </Button>
      </div>
    </section>
  );
}
