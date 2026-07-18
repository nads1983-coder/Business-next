import type { Metadata } from "next";
import { ArrowRight, BookOpenCheck, CheckCircle2, Clock, ListChecks, SearchCheck } from "lucide-react";
import {
  businessComplianceHubCategories,
  businessComplianceHubPathways,
  getBusinessComplianceHubFeaturedArticles,
  getIndexableResourceArticles,
  getResourceArticle,
  resourcePath
} from "@/content/resources";
import { JsonLd, absoluteUrl, breadcrumbSchema, createPageMetadata } from "@/lib/seo";
import { Breadcrumbs, ResourceCard } from "@/components/resource-guide";
import { PublicPage } from "@/components/public-page";
import { ResourceTrackedLink, ResourceViewTracker } from "@/components/resource-analytics";
import { resourceAnalyticsEvents } from "@/lib/resource-analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = createPageMetadata({
  title: "UK Business Compliance Hub",
  description:
    "Practical UK business compliance guides covering live Companies House resources, company responsibilities and planned guidance on Corporation Tax, VAT and PAYE.",
  path: "/resources"
});

const liveCompaniesHouseArticleCount = getIndexableResourceArticles().filter(
  (article) => article.category === "companies-house"
).length;
const featuredArticles = getBusinessComplianceHubFeaturedArticles();

export default function ResourcesPage() {
  const featuredItemList = featuredArticles.map((article, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: absoluteUrl(resourcePath(article.slug)),
    name: article.title
  }));

  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${absoluteUrl("/resources")}#webpage`,
            url: absoluteUrl("/resources"),
            name: "UK Business Compliance Hub",
            description:
              "Practical UK business compliance guides covering live Companies House resources and planned future clusters."
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${absoluteUrl("/resources")}#live-categories`,
            name: "Live business compliance guide categories",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                url: absoluteUrl("/resources/companies-house"),
                name: "Companies House"
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${absoluteUrl("/resources")}#featured-guides`,
            name: "Featured Companies House guides",
            itemListElement: featuredItemList
          }
        ]}
      />
      <ResourceViewTracker
        eventName={resourceAnalyticsEvents.complianceHubViewed}
        eventKey="compliance-hub:index"
        props={{ link_location: "compliance_hub" }}
      />
      <div className="space-y-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources" }]} />

        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div className="max-w-3xl">
            <Badge variant="calm">Business Compliance Hub</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal">
              UK Business Compliance Hub
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Understand the deadlines, filings and responsibilities involved in running a UK
              limited company. The live guides are source-linked to official UK information and
              reviewed so each page stays useful before you act.
            </p>
          </div>
          <aside className="rounded-md border bg-secondary/30 p-5">
            <h2 className="text-xl font-semibold tracking-normal">Keep the reading connected to your tasks</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Keep important company deadlines and responsibilities organised in one place with
              BusinessSorted.
            </p>
            <div className="mt-5">
              <Button asChild>
                <ResourceTrackedLink
                  href="/register"
                  eventName={resourceAnalyticsEvents.complianceHubProductCtaClicked}
                  eventProps={{ cta_variant: "hub_hero_primary", link_location: "hub_hero" }}
                >
                  Start setup <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ResourceTrackedLink>
              </Button>
            </div>
          </aside>
        </header>

        <section className="space-y-4" aria-labelledby="compliance-categories-heading">
          <div className="max-w-3xl">
            <h2 id="compliance-categories-heading" className="text-2xl font-semibold tracking-normal">
              Compliance guide categories
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Companies House guides are live now. Other categories are shown as planned so the hub
              can grow without publishing empty or thin category pages.
            </p>
          </div>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {businessComplianceHubCategories.map((category) => {
              const featuredGuideSlug = "featuredGuideSlug" in category ? category.featuredGuideSlug : undefined;
              const featuredGuide = featuredGuideSlug
                ? getResourceArticle(featuredGuideSlug)
                : undefined;
              const isLive = category.status === "live";

              return (
                <li key={category.slug} className="flex">
                  <Card className="flex w-full flex-col">
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {isLive ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                          )}
                          {category.name}
                        </CardTitle>
                        <Badge variant={isLive ? "calm" : "outline"}>
                          {isLive ? "Live" : "Coming soon"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-4 text-sm leading-6 text-muted-foreground">
                      <p>{category.description}</p>
                      {isLive ? (
                        <>
                          <p className="font-medium text-foreground">
                            {liveCompaniesHouseArticleCount} published guides
                          </p>
                          {featuredGuide ? (
                            <p>
                              Featured:{" "}
                              <ResourceTrackedLink
                                href={resourcePath(featuredGuide.slug)}
                                className="font-medium text-primary underline"
                                eventName={resourceAnalyticsEvents.complianceHubFeaturedGuideClicked}
                                eventProps={{
                                  category: category.analyticsId,
                                  guide_slug: featuredGuide.slug,
                                  link_location: "hub_category_card_featured"
                                }}
                              >
                                {featuredGuide.title}
                              </ResourceTrackedLink>
                            </p>
                          ) : null}
                          <ResourceTrackedLink
                            href={category.destination}
                            className="mt-auto inline-flex items-center gap-2 font-medium text-primary underline"
                            eventName={resourceAnalyticsEvents.complianceHubCategoryClicked}
                            eventProps={{
                              category: category.analyticsId,
                              destination_type: "resource",
                              link_location: "hub_category_card_cta"
                            }}
                          >
                            {category.ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </ResourceTrackedLink>
                        </>
                      ) : (
                        <p className="mt-auto font-medium text-foreground">
                          Guides in development. No public category page is published yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-4" aria-labelledby="featured-guides-heading">
          <div className="max-w-3xl">
            <h2 id="featured-guides-heading" className="flex items-center gap-2 text-2xl font-semibold tracking-normal">
              <BookOpenCheck className="h-6 w-6 text-primary" aria-hidden="true" />
              Featured Companies House guides
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Start with cornerstone guides that answer high-intent questions and point to the next
              practical step.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredArticles.map((article) => (
              <ResourceCard
                key={article.slug}
                article={article}
                trackingEventName={resourceAnalyticsEvents.complianceHubFeaturedGuideClicked}
                trackingProps={{
                  category: "companies_house",
                  guide_slug: article.slug
                }}
                linkLocationPrefix="hub_featured_guide"
              />
            ))}
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="pathways-heading">
          <div className="max-w-3xl">
            <h2 id="pathways-heading" className="flex items-center gap-2 text-2xl font-semibold tracking-normal">
              <SearchCheck className="h-6 w-6 text-primary" aria-hidden="true" />
              Where to begin
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Choose the situation closest to yours and start with the live guide that answers the
              next question.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {businessComplianceHubPathways.map((pathway) => (
              <Card key={pathway.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
                    {pathway.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-muted-foreground">{pathway.description}</p>
                  <ul className="space-y-3 text-sm">
                    {pathway.links.map((link) => {
                      const article = getResourceArticle(link.slug);
                      if (!article || article.status !== "published") return null;

                      return (
                        <li key={link.slug}>
                          <ResourceTrackedLink
                            href={resourcePath(link.slug)}
                            className="font-medium text-primary underline"
                            eventName={resourceAnalyticsEvents.complianceHubPathwayClicked}
                            eventProps={{
                              guide_slug: link.slug,
                              link_location: "hub_pathway",
                              category: article.category
                            }}
                          >
                            {link.label}
                          </ResourceTrackedLink>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-md border bg-secondary/30 p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">Turn important dates into practical tasks</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                BusinessSorted helps UK business owners organise important company tasks and
                deadlines. The guides stay useful on their own, and the product helps you keep the
                next actions visible.
              </p>
            </div>
            <Button asChild>
              <ResourceTrackedLink
                href="/register"
                eventName={resourceAnalyticsEvents.complianceHubProductCtaClicked}
                eventProps={{ cta_variant: "hub_footer_primary", link_location: "hub_footer" }}
              >
                Start setup <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ResourceTrackedLink>
            </Button>
          </div>
        </section>
      </div>
    </PublicPage>
  );
}
