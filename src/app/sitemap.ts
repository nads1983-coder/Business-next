import type { MetadataRoute } from "next";

const baseUrl = "https://businesssorted.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/pricing",
    "/terms",
    "/privacy",
    "/subscription-terms",
    "/refunds",
    "/cookies",
    "/support",
    "/login",
    "/register"
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7
  }));
}
