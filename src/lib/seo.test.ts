import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { absoluteUrl, siteConfig } from "@/config/site";
import { resourceGuides, resourcePath } from "@/content/resources";
import { createPageMetadata, jsonLd } from "@/lib/seo";

describe("SEO configuration", () => {
  it("creates absolute production URLs with the canonical non-www host", () => {
    expect(siteConfig.url).toBe("https://businesssorted.uk");
    expect(absoluteUrl("/pricing")).toBe("https://businesssorted.uk/pricing");
    expect(absoluteUrl("support")).toBe("https://businesssorted.uk/support");
  });

  it("generates self-referencing public page metadata", () => {
    const metadata = createPageMetadata({
      title: "Business Sorted Pricing",
      description: "Pricing for Business Sorted.",
      path: "/pricing"
    });

    expect(metadata.alternates?.canonical).toBe("/pricing");
    expect(metadata.openGraph?.url).toBe("https://businesssorted.uk/pricing");
    expect(metadata.openGraph?.images).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://businesssorted.uk/opengraph-image"
        })
      ])
    );
  });

  it("keeps account and private application routes out of the XML sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://businesssorted.uk/");
    expect(urls).toContain("https://businesssorted.uk/pricing");
    expect(urls).toContain("https://businesssorted.uk/resources");
    expect(urls).toContain("https://businesssorted.uk/about");
    expect(urls).toContain("https://businesssorted.uk/editorial-policy");
    expect(urls).not.toContain("https://businesssorted.uk/login");
    expect(urls).not.toContain("https://businesssorted.uk/register");
    expect(urls.some((url) => url.includes("/app"))).toBe(false);
  });

  it("includes every resource guide in the XML sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const guide of resourceGuides) {
      expect(urls).toContain(absoluteUrl(resourcePath(guide.slug)));
    }
  });

  it("keeps resource guide titles, descriptions and related links unique and useful", () => {
    const titles = new Set(resourceGuides.map((guide) => guide.title));
    const descriptions = new Set(resourceGuides.map((guide) => guide.description));

    expect(titles.size).toBe(resourceGuides.length);
    expect(descriptions.size).toBe(resourceGuides.length);

    for (const guide of resourceGuides) {
      expect(guide.related).toHaveLength(3);
      expect(guide.faqs.length).toBeGreaterThanOrEqual(2);
      expect(guide.officialSources.length).toBeGreaterThanOrEqual(2);
      expect(guide.h1).not.toBe(guide.title);
    }
  });

  it("protects private and reset routes in robots.txt while declaring the sitemap", () => {
    const rules = robots().rules;

    expect(robots().sitemap).toBe("https://businesssorted.uk/sitemap.xml");
    expect(rules).toEqual(
      expect.objectContaining({
        userAgent: "*",
        allow: "/",
        disallow: expect.arrayContaining(["/app/", "/api/", "/reset-password"])
      })
    );
  });

  it("escapes JSON-LD payloads before injecting them into a script tag", () => {
    expect(jsonLd({ name: "<Business Sorted>" }).__html).toBe(
      '{"name":"\\u003cBusiness Sorted>"}'
    );
  });
});
