import type { MetadataRoute } from "next";
import { guideHubs, guides } from "@/content/seo-content";
import { resourceGuides, resourcePath } from "@/content/resources";

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
    ...resourceGuides.map((guide) => resourcePath(guide.slug)),
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
    changeFrequency: path.startsWith("/guides") || path.startsWith("/resources") ? "monthly" : "weekly",
    priority: path === "" ? 1 : path === "/resources" || path.startsWith("/guides") ? 0.8 : 0.7
  }));
}
