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

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    "",
    "/about",
    "/editorial-policy",
    "/how-we-research",
    "/guides",
    ...guideHubs.map((hub) => hub.path),
    ...guides.map((guide) => `/guides/${guide.category}/${guide.slug}`),
    "/resources",
    ...Object.keys(resourceCategories).map((category) =>
      resourceCategoryPath(category as keyof typeof resourceCategories)
    ),
    ...getIndexableResourceArticles().map((article) => resourcePath(article.slug)),
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

  return publicRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
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
  }));
}
