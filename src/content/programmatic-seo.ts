import businessSortedProgrammaticSeo from "@/content/programmatic-seo/business-sorted.json";
import type { ResourceArticle } from "@/content/resources";

const schemaVersion = "business-sorted-pseo-v1";
const origin = "https://businesssorted.uk";
const allowedPaths = new Set([
  "/resources/mtd-income-tax-deadline-plan-for-sole-traders",
  "/resources/mtd-income-tax-deadline-plan-for-landlords",
  "/resources/sole-trader-deadline-calendar",
  "/resources/vat-registered-business-deadline-calendar",
  "/resources/first-year-sole-trader-compliance-plan",
  "/resources/employer-payroll-deadline-calendar"
]);

type ProgrammaticRecord = {
  slug: string;
  status: string;
  canonicalPath: string;
  canonicalUrl: string;
  score: { total: number };
  sourceEvidence: { url: string; dateChecked: string; effectiveDate: string; reviewDate: string; claim: string }[];
  resourceArticle: ResourceArticle;
};

function assertProgrammaticSeoArtifact() {
  if (businessSortedProgrammaticSeo.schemaVersion !== schemaVersion) {
    throw new Error("Invalid Business Sorted programmatic SEO schema version");
  }
  if (businessSortedProgrammaticSeo.target.origin !== origin) {
    throw new Error("Invalid Business Sorted programmatic SEO origin");
  }

  const paths = new Set<string>();
  for (const record of businessSortedProgrammaticSeo.records as ProgrammaticRecord[]) {
    if (record.status !== "approved") throw new Error(`Unapproved programmatic record: ${record.slug}`);
    if (record.score.total < 75) throw new Error(`Programmatic record below approval threshold: ${record.slug}`);
    if (!allowedPaths.has(record.canonicalPath)) throw new Error(`Unexpected programmatic path: ${record.canonicalPath}`);
    if (record.canonicalPath.endsWith("/")) throw new Error(`Trailing slash programmatic path: ${record.canonicalPath}`);
    if (record.canonicalUrl !== `${origin}${record.canonicalPath}`) throw new Error(`Invalid programmatic canonical: ${record.slug}`);
    if (paths.has(record.canonicalPath)) throw new Error(`Duplicate programmatic path: ${record.canonicalPath}`);
    paths.add(record.canonicalPath);
    if (record.resourceArticle.slug !== record.slug) throw new Error(`Programmatic article slug mismatch: ${record.slug}`);
    if (record.resourceArticle.canonicalUrl !== record.canonicalUrl) throw new Error(`Programmatic article canonical mismatch: ${record.slug}`);
    if (record.resourceArticle.category !== "hmrc") throw new Error(`Unexpected programmatic category: ${record.slug}`);
    if (record.resourceArticle.status !== "published" || record.resourceArticle.robots !== "index") {
      throw new Error(`Programmatic article is not indexable: ${record.slug}`);
    }
    if (record.resourceArticle.internalLinks.some((link) => link.href === record.canonicalPath)) {
      throw new Error(`Programmatic article self-links: ${record.slug}`);
    }
    if (record.sourceEvidence.length < 2) throw new Error(`Programmatic article lacks source evidence: ${record.slug}`);
    for (const source of record.sourceEvidence) {
      if (!source.url.startsWith("https://www.gov.uk/")) throw new Error(`Programmatic source is not GOV.UK: ${record.slug}`);
      if (!source.dateChecked || !source.effectiveDate || !source.reviewDate || !source.claim) {
        throw new Error(`Programmatic source evidence is incomplete: ${record.slug}`);
      }
    }
  }
}

assertProgrammaticSeoArtifact();

export const programmaticSeoRecords = businessSortedProgrammaticSeo.records as ProgrammaticRecord[];
export const programmaticResourceArticles = programmaticSeoRecords.map((record) => record.resourceArticle);
export const programmaticRejectedCandidates = businessSortedProgrammaticSeo.rejected;
export const programmaticCandidateSummaries = businessSortedProgrammaticSeo.candidates;
