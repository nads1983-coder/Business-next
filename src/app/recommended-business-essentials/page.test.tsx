import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { amazonAffiliateConfig } from "@/config/affiliate";
import {
  businessEssentialsRecommendations,
  recommendedBusinessEssentialsPath
} from "@/content/affiliate-recommendations";
import sitemap from "@/app/sitemap";
import RecommendedBusinessEssentialsPage, { metadata } from "./page";

describe("recommended business essentials affiliate page", () => {
  it("uses only tagged Amazon UK URLs", () => {
    for (const recommendation of businessEssentialsRecommendations) {
      const url = new URL(recommendation.searchUrl);

      expect(url.hostname).toBe("www.amazon.co.uk");
      expect(url.searchParams.get("tag")).toBe(amazonAffiliateConfig.storeId);
      expect(recommendation.searchUrl).not.toContain("amazon.com");
    }
  });

  it("renders required affiliate disclosure before the first Amazon link", () => {
    const html = renderToStaticMarkup(<RecommendedBusinessEssentialsPage />);
    const disclosureIndex = html.indexOf(amazonAffiliateConfig.disclosure);
    const firstAmazonLinkIndex = html.indexOf("href=\"https://www.amazon.co.uk");

    expect(disclosureIndex).toBeGreaterThanOrEqual(0);
    expect(firstAmazonLinkIndex).toBeGreaterThan(disclosureIndex);
  });

  it("marks every affiliate link as sponsored and opens it safely", () => {
    const html = renderToStaticMarkup(<RecommendedBusinessEssentialsPage />);
    const amazonLinkMatches = [...html.matchAll(/<a[^>]+href="https:\/\/www\.amazon\.co\.uk[^"]+"[^>]*>/g)];

    expect(amazonLinkMatches.length).toBe(businessEssentialsRecommendations.length);

    for (const [anchor] of amazonLinkMatches) {
      expect(anchor).toContain(`target="${amazonAffiliateConfig.target}"`);
      expect(anchor).toContain(`rel="${amazonAffiliateConfig.linkRel}"`);
      expect(anchor).toContain(`tag=${amazonAffiliateConfig.storeId}`);
      expect(anchor).not.toContain("amazon.com");
    }
  });

  it("is included in the sitemap with self-referencing metadata", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://businesssorted.uk/recommended-business-essentials");
    expect(metadata.title).toBe("Recommended Business Essentials for UK Small Businesses");
    expect(metadata.alternates?.canonical).toBe(`https://businesssorted.uk${recommendedBusinessEssentialsPath}`);
    expect(metadata.openGraph?.url).toBe(`https://businesssorted.uk${recommendedBusinessEssentialsPath}`);
  });

  it("renders breadcrumb, CollectionPage and ItemList structured data", () => {
    const html = renderToStaticMarkup(<RecommendedBusinessEssentialsPage />);

    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"@type":"CollectionPage"');
    expect(html).toContain('"@type":"ItemList"');
    expect(html).toContain('"@id":"https://businesssorted.uk/recommended-business-essentials#amazon-uk-searches"');
  });
});
