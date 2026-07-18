import type { MetadataRoute } from "next";
import { comparisonPath, comparisonResources } from "@/content/authority";
import { guideHubs, guides } from "@/content/seo-content";
import {
  getIndexableResourceArticles,
  resourceCategories,
  resourceCategoryPath,
  resourcePath
} from "@/content/resources";

const baseUrl = "https://businesssorted.uk";
const defaultLastModified = new Date("2026-07-18T00:00:00Z");

function sitemapEntry(path: string, lastModified = defaultLastModified): MetadataRoute.Sitemap[number] {
  return {
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency:
      path.startsWith("/guides") || path.startsWith("/resources") || path.startsWith("/comparisons")
        ? "monthly"
        : "weekly",
    priority:
      path === ""
        ? 1
        : path === "/resources" || path === "/tools" || path === "/comparisons" || path.startsWith("/guides")
          ? 0.8
          : 0.7
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    "",
    "/about",
    "/editorial-policy",
    "/how-we-research",
    "/guides",
    ...guideHubs.map((hub) => hub.path),
    ...guides.map((guide) => `/guides/${guide.category}/${guide.slug}`),
    "/tools",
    "/tools/deadline-calculators",
    "/tools/decision-tools",
    "/comparisons",
    ...comparisonResources.map((comparison) => comparisonPath(comparison.slug)),
    "/downloads",
    "/updates",
    "/deadlines",
    "/checklists",
    "/glossary",
    "/pricing",
    "/terms",
    "/privacy",
    "/subscription-terms",
    "/refunds",
    "/cookies",
    "/support"
  ];

  const latestResourceReview = getIndexableResourceArticles()
    .map((article) => article.lastReviewedDate)
    .sort()
    .at(-1);
  const resourceLastModified = latestResourceReview
    ? new Date(`${latestResourceReview}T00:00:00Z`)
    : defaultLastModified;

  return [
    ...publicRoutes.map((path) => sitemapEntry(path)),
    sitemapEntry("/resources", resourceLastModified),
    ...Object.keys(resourceCategories).map((category) =>
      sitemapEntry(resourceCategoryPath(category as keyof typeof resourceCategories), resourceLastModified)
    ),
    ...getIndexableResourceArticles().map((article) =>
      sitemapEntry(resourcePath(article.slug), new Date(`${article.lastReviewedDate}T00:00:00Z`))
    )
  ];
}
