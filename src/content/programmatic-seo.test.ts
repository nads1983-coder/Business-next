import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import {
  programmaticCandidateSummaries,
  programmaticRejectedCandidates,
  programmaticResourceArticles,
  programmaticSeoRecords
} from "@/content/programmatic-seo";
import { getResourceArticle, resourcePath } from "@/content/resources";
import { absoluteUrl } from "@/lib/seo";

describe("Business Sorted programmatic SEO integration", () => {
  it("renders only approved records through the resource content model", () => {
    expect(programmaticSeoRecords).toHaveLength(6);
    expect(programmaticRejectedCandidates).toHaveLength(8);
    expect(programmaticCandidateSummaries).toHaveLength(14);

    for (const record of programmaticSeoRecords) {
      expect(record.status).toBe("approved");
      expect(record.score.total).toBeGreaterThanOrEqual(75);
      expect(record.canonicalPath).toBe(resourcePath(record.slug));
      expect(record.canonicalPath.endsWith("/")).toBe(false);
      expect(record.canonicalUrl).toBe(absoluteUrl(record.canonicalPath));
      expect(getResourceArticle(record.slug)).toEqual(record.resourceArticle);
    }
  });

  it("keeps source evidence current, official and reviewable", () => {
    for (const record of programmaticSeoRecords) {
      expect(record.sourceEvidence.length).toBeGreaterThanOrEqual(2);
      for (const source of record.sourceEvidence) {
        expect(source.url).toMatch(/^https:\/\/www\.gov\.uk\//);
        expect(source.dateChecked).toBe("2026-08-23");
        expect(source.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(source.reviewDate).toBe("2026-11-30");
        expect(source.claim.length).toBeGreaterThan(80);
      }
    }
  });

  it("prevents duplicate metadata, self-links and rejected-route leakage", () => {
    const metadata = new Set<string>();
    const approvedPaths = new Set(programmaticSeoRecords.map((record) => record.canonicalPath));

    for (const article of programmaticResourceArticles) {
      const key = `${article.socialTitle}:${article.socialDescription}`;
      expect(metadata.has(key)).toBe(false);
      metadata.add(key);
      expect(article.internalLinks.some((link) => link.href === resourcePath(article.slug))).toBe(false);
      expect(article.officialSources.length).toBeGreaterThanOrEqual(2);
      expect(article.faqs.length).toBeGreaterThanOrEqual(2);
    }

    for (const candidate of programmaticRejectedCandidates as { canonicalPath: string; status: string; rejectionReasons: string[] }[]) {
      expect(candidate.status).toBe("rejected");
      expect(approvedPaths.has(candidate.canonicalPath)).toBe(false);
      expect(candidate.rejectionReasons.join(" ")).toMatch(/Rejected|below 75|overlap|owns|score/i);
    }
  });

  it("includes approved resources and HMRC parent in the sitemap only", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://businesssorted.uk/resources/hmrc");
    for (const record of programmaticSeoRecords) {
      expect(urls).toContain(record.canonicalUrl);
    }

    for (const candidate of programmaticRejectedCandidates as { canonicalPath: string; canonicalUrl: string }[]) {
      if (candidate.canonicalPath.startsWith("/making-tax-digital/")) continue;
      expect(urls).not.toContain(candidate.canonicalUrl);
    }
  });
});
