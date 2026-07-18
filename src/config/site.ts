import { productConfig } from "@/config/product";

export const siteConfig = {
  name: productConfig.name,
  url: "https://businesssorted.uk",
  ogImagePath: "/opengraph-image",
  audience: "first-time UK business owners",
  primaryOffer: "plain-English business deadline guidance",
  supportEmail: productConfig.supportEmail,
  description:
    "Business Sorted helps first-time UK business owners understand what needs doing, when it is due and what to prepare in plain English."
} as const;

export function absoluteUrl(path = "/") {
  const normalisedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalisedPath}`;
}
