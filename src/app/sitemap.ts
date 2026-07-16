import type { MetadataRoute } from "next";
import { guideHubs, guides } from "@/content/seo-content";

const baseUrl = "https://businesssorted.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    "",
    "/about",
    "/guides",
    ...guideHubs.map((hub) => hub.path),
    ...guides.map((guide) => `/guides/${guide.category}/${guide.slug}`),
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
    changeFrequency: path.startsWith("/guides") ? "monthly" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/guides") ? 0.8 : 0.7
  }));
}
