import type { Metadata } from "next";
import { productConfig } from "@/config/product";

export const siteUrl = "https://businesssorted.uk";

export function absoluteUrl(path = "") {
  if (!path || path === "/") {
    return siteUrl;
  }

  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
  type = "website"
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false
          }
        }
      : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: productConfig.name,
      type
    },
    twitter: {
      card: "summary",
      title,
      description
    }
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c")
      }}
    />
  );
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: productConfig.name,
    legalName: "Nadine Pierre Ltd",
    url: siteUrl,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: productConfig.supportEmail
    }
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: productConfig.name,
    url: siteUrl,
    publisher: {
      "@id": `${siteUrl}/#organization`
    }
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}
