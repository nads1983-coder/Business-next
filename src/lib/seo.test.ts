import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { absoluteUrl, siteConfig } from "@/config/site";
import { comparisonPath, comparisonResources, downloadableResources } from "@/content/authority";
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

    expect(metadata.alternates?.canonical).toBe("https://businesssorted.uk/pricing");
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

    expect(urls).toContain("https://businesssorted.uk");
    expect(urls).toContain("https://businesssorted.uk/pricing");
    expect(urls).toContain("https://businesssorted.uk/resources");
    expect(urls).toContain("https://businesssorted.uk/tools");
    expect(urls).toContain("https://businesssorted.uk/comparisons");
    expect(urls).toContain("https://businesssorted.uk/downloads");
    expect(urls).toContain("https://businesssorted.uk/updates");
    expect(urls).toContain("https://businesssorted.uk/about");
    expect(urls).toContain("https://businesssorted.uk/editorial-policy");
    expect(urls).not.toContain("https://businesssorted.uk/login");
    expect(urls).not.toContain("https://businesssorted.uk/register");
    expect(urls).not.toContain("https://businesssorted.uk/app/money");
    expect(urls).not.toContain("https://businesssorted.uk/app/ask");
    expect(urls).not.toContain("https://businesssorted.uk/app/calendar");
    expect(urls.some((url) => url.includes("/app"))).toBe(false);
  });

  it("includes every resource guide in the XML sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const guide of resourceGuides) {
      expect(urls).toContain(absoluteUrl(resourcePath(guide.slug)));
    }
  });

  it("includes every comparison page in the XML sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const comparison of comparisonResources) {
      expect(urls).toContain(absoluteUrl(comparisonPath(comparison.slug)));
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

  it("keeps authority resources source-led and downloadable", () => {
    expect(comparisonResources.length).toBeGreaterThanOrEqual(3);
    expect(downloadableResources.length).toBeGreaterThanOrEqual(3);

    for (const comparison of comparisonResources) {
      expect(comparison.sources.length).toBeGreaterThanOrEqual(2);
      expect(comparison.rows.length).toBeGreaterThanOrEqual(3);
      expect(comparison.related.length).toBeGreaterThanOrEqual(3);
    }

    for (const download of downloadableResources) {
      expect(download.items.length).toBeGreaterThanOrEqual(5);
      expect(download.sources.length).toBeGreaterThanOrEqual(2);
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
