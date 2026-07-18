import { describe, expect, it } from "vitest";
import {
  businessComplianceHubCategories,
  businessComplianceHubFeaturedGuideSlugs,
  businessComplianceHubPathways,
  getBusinessComplianceHubFeaturedArticles,
  getResourceArticle,
  getIndexableResourceArticles,
  resourceArticles,
  resourceCategories,
  resourceGroups,
  resourceCategoryPath,
  resourcePath,
  resourceUrl,
  validateResourceArticles
} from "@/content/resources";
import { getResourceDestinationType } from "@/lib/resource-analytics";

describe("resource centre content", () => {
  it("publishes a substantive, validated Companies House cluster", () => {
    expect(validateResourceArticles()).toEqual([]);
    expect(getIndexableResourceArticles()).toHaveLength(19);

    for (const article of getIndexableResourceArticles()) {
      expect(article.status).toBe("published");
      expect(article.robots).toBe("index");
      expect(article.canonicalUrl).toBe(`https://businesssorted.uk${resourcePath(article.slug)}`);
      expect(article.officialSources.length).toBeGreaterThanOrEqual(2);
      expect(article.internalLinks.length).toBeGreaterThanOrEqual(3);
      expect(article.directAnswer).not.toBe(article.summary);
      expect(article.supportingQuestions.length).toBeGreaterThanOrEqual(2);
      expect(article.officialSources.every((source) => source.href.startsWith("https://www.gov.uk") || source.href.startsWith("https://find-and-update.company-information.service.gov.uk"))).toBe(true);
      expect(`${article.title} ${article.description} ${article.socialTitle} ${article.socialDescription} ${article.canonicalUrl}`).not.toMatch(/localhost|vercel\.app/i);
    }
  });

  it("keeps categories explicit and routable", () => {
    expect(Object.keys(resourceCategories)).toEqual(["companies-house"]);
    expect(resourceCategoryPath("companies-house")).toBe("/resources/companies-house");
    expect(Object.keys(resourceGroups)).toEqual([
      "confirmation-statements",
      "company-accounts",
      "company-information",
      "authentication-access",
      "dormant-companies",
      "directors-first-year"
    ]);
  });

  it("models the Business Compliance Hub without publishing thin future category pages", () => {
    expect(businessComplianceHubCategories.map((category) => category.slug)).toEqual([
      "companies-house",
      "corporation-tax",
      "vat",
      "paye",
      "directors",
      "starting-a-limited-company",
      "running-a-limited-company"
    ]);

    const liveCategory = businessComplianceHubCategories.find((category) => category.slug === "companies-house");
    expect(liveCategory).toEqual(
      expect.objectContaining({
        status: "live",
        destination: "/resources/companies-house",
        ctaLabel: "Explore Companies House guides"
      })
    );

    for (const category of businessComplianceHubCategories.filter((item) => item.status === "coming-soon")) {
      expect(category).not.toHaveProperty("destination");
      expect(Object.keys(resourceCategories)).not.toContain(category.slug);
    }
  });

  it("keeps hub featured guides and pathways backed by published articles", () => {
    expect(getBusinessComplianceHubFeaturedArticles()).toHaveLength(6);

    for (const slug of businessComplianceHubFeaturedGuideSlugs) {
      expect(getResourceArticle(slug)?.status).toBe("published");
    }

    for (const pathway of businessComplianceHubPathways) {
      expect(pathway.links.length).toBeGreaterThanOrEqual(3);
      for (const link of pathway.links) {
        expect(getResourceArticle(link.slug)?.status).toBe("published");
      }
    }
  });

  it("keeps article relationships and resource internal links resolvable", () => {
    for (const article of getIndexableResourceArticles()) {
      for (const slug of article.relatedArticleSlugs) {
        expect(slug).not.toBe(article.slug);
        expect(getResourceArticle(slug)?.status).toBe("published");
      }

      for (const link of article.internalLinks) {
        expect(link.href).not.toBe(resourcePath(article.slug));
        if (link.href.startsWith("/resources/") && link.href !== "/resources/companies-house") {
          const slug = link.href.replace("/resources/", "");
          expect(getResourceArticle(slug)?.status).toBe("published");
        }
      }
    }
  });

  it("keeps resource CTA destinations intentional and measurable", () => {
    for (const article of getIndexableResourceArticles()) {
      for (const link of article.internalLinks) {
        expect(["registration", "pricing", "resource", "homepage", "support", "unknown"]).toContain(
          getResourceDestinationType(link.href)
        );
      }
    }
  });

  it("keeps canonical URLs unique and self-referencing", () => {
    const canonicals = new Set(getIndexableResourceArticles().map((article) => article.canonicalUrl));
    expect(canonicals.size).toBe(getIndexableResourceArticles().length);

    for (const article of getIndexableResourceArticles()) {
      expect(article.canonicalUrl).toBe(resourceUrl(article.slug));
    }
  });

  it("detects duplicate and broken resource metadata", () => {
    const duplicate = [
      resourceArticles[0],
      {
        ...resourceArticles[0],
        relatedArticleSlugs: ["missing-resource"]
      }
    ];

    expect(validateResourceArticles(duplicate)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "slug" }),
        expect.objectContaining({ field: "title" }),
        expect.objectContaining({ field: "relatedArticleSlugs" })
      ])
    );
  });
});
