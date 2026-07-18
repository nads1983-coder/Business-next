import { describe, expect, it } from "vitest";
import {
  getIndexableResourceArticles,
  resourceArticles,
  resourceCategories,
  resourceCategoryPath,
  resourcePath,
  validateResourceArticles
} from "@/content/resources";

describe("resource centre content", () => {
  it("publishes only substantive, validated demonstration articles", () => {
    expect(validateResourceArticles()).toEqual([]);
    expect(getIndexableResourceArticles()).toHaveLength(2);

    for (const article of getIndexableResourceArticles()) {
      expect(article.status).toBe("published");
      expect(article.robots).toBe("index");
      expect(article.canonicalUrl).toBe(`https://businesssorted.uk${resourcePath(article.slug)}`);
      expect(article.officialSources.length).toBeGreaterThanOrEqual(2);
      expect(article.internalLinks.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps categories explicit and routable", () => {
    expect(Object.keys(resourceCategories)).toEqual(["companies-house"]);
    expect(resourceCategoryPath("companies-house")).toBe("/resources/companies-house");
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
