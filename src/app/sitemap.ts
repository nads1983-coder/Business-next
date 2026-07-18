import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { resourceGuides, resourcePath } from "@/content/resources";

const publicRoutes = [
  "",
  "/resources",
  "/pricing",
  "/about",
  "/editorial-policy",
  "/how-we-research",
  "/support",
  "/terms",
  "/privacy",
  "/subscription-terms",
  "/refunds",
  "/cookies"
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const guideRoutes = resourceGuides.map((guide) => resourcePath(guide.slug));

  return [...publicRoutes, ...guideRoutes].map((path) => ({
    url: absoluteUrl(path || "/"),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : path === "/pricing" || path === "/resources" ? 0.9 : 0.6
  }));
}
