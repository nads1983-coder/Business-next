import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/app/",
        "/api/",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/check-email"
      ]
    },
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
