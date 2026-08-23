import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const sourceExport =
  process.env.PSEO_BUSINESS_SORTED_EXPORT ??
  "/Users/nadinepierre/Documents/ChatGPT/Programatic SEO/programmatic-seo/exports/business-sorted.json";
const outputPath = resolve("src/content/programmatic-seo/business-sorted.json");
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

type ExportDocument = {
  schemaVersion: string;
  source: unknown;
  target: { origin: string };
  records: ExportRecord[];
  rejected: unknown[];
  candidates: unknown[];
};

type ExportRecord = {
  slug: string;
  status: string;
  canonicalPath: string;
  canonicalUrl: string;
  score: { total: number };
  sourceEvidence: { url: string; dateChecked: string; effectiveDate: string; reviewDate: string; claim: string }[];
  resourceArticle: {
    slug: string;
    canonicalUrl: string;
    category: string;
    robots: string;
    status: string;
    title: string;
    description: string;
    socialTitle: string;
    socialDescription: string;
    internalLinks: { label: string; href: string }[];
    officialSources: { label: string; href: string; publisher: string }[];
  };
};

function parseDocument(): ExportDocument {
  const document = JSON.parse(readFileSync(sourceExport, "utf8")) as ExportDocument;
  if (document.schemaVersion !== schemaVersion) throw new Error("Invalid Business Sorted schema version");
  if (document.target?.origin !== origin) throw new Error("Invalid Business Sorted origin");
  if (!Array.isArray(document.records)) throw new Error("Business Sorted export records must be an array");
  if (!Array.isArray(document.rejected)) throw new Error("Business Sorted rejected candidates must be an array");
  return document;
}

function validateRecord(record: ExportRecord, paths: Set<string>) {
  if (record.status !== "approved") throw new Error(`Unapproved record cannot be synced: ${record.slug}`);
  if (record.score.total < 75) throw new Error(`Approved record below threshold: ${record.slug}`);
  if (!allowedPaths.has(record.canonicalPath)) throw new Error(`Unexpected canonical path: ${record.canonicalPath}`);
  if (record.canonicalPath.endsWith("/")) throw new Error(`Trailing slash canonical path: ${record.canonicalPath}`);
  if (record.canonicalUrl !== `${origin}${record.canonicalPath}`) throw new Error(`Invalid canonical URL: ${record.slug}`);
  if (paths.has(record.canonicalPath)) throw new Error(`Duplicate canonical path: ${record.canonicalPath}`);
  paths.add(record.canonicalPath);
  if (record.resourceArticle.slug !== record.slug) throw new Error(`Resource article slug mismatch: ${record.slug}`);
  if (record.resourceArticle.canonicalUrl !== record.canonicalUrl) throw new Error(`Resource canonical mismatch: ${record.slug}`);
  if (record.resourceArticle.category !== "hmrc") throw new Error(`Unexpected category for ${record.slug}`);
  if (record.resourceArticle.status !== "published" || record.resourceArticle.robots !== "index") {
    throw new Error(`Approved record is not indexable: ${record.slug}`);
  }
  if (record.resourceArticle.officialSources.length < 2) throw new Error(`Insufficient sources: ${record.slug}`);
  if (record.sourceEvidence.length < 2) throw new Error(`Insufficient source evidence: ${record.slug}`);
  for (const source of record.sourceEvidence) {
    if (!source.url.startsWith("https://www.gov.uk/")) throw new Error(`Non-primary source on ${record.slug}: ${source.url}`);
    if (!source.dateChecked || !source.effectiveDate || !source.reviewDate || !source.claim) {
      throw new Error(`Incomplete source evidence: ${record.slug}`);
    }
  }
  for (const link of record.resourceArticle.internalLinks) {
    if (link.href === record.canonicalPath) throw new Error(`Self-link found: ${record.slug}`);
    if (!link.href.startsWith("/")) throw new Error(`External internal link found: ${record.slug}`);
    if (link.href.endsWith("/") && link.href !== "/") throw new Error(`Trailing slash internal link: ${link.href}`);
  }
}

const source = parseDocument();
const paths = new Set<string>();
const records = source.records.map((record) => {
  validateRecord(record, paths);
  return record;
});

const artifact = {
  schemaVersion,
  syncedAt: new Date(0).toISOString(),
  source: source.source,
  target: source.target,
  records,
  rejected: source.rejected,
  candidates: source.candidates
};

mkdirSync(dirname(outputPath), { recursive: true });
const previous = (() => {
  try {
    return readFileSync(outputPath, "utf8");
  } catch {
    return "";
  }
})();
const next = `${JSON.stringify(artifact, null, 2)}\n`;
writeFileSync(outputPath, next);

const previousDoc = previous ? JSON.parse(previous) : { records: [] };
const previousByPath = new Map((previousDoc.records ?? []).map((record: ExportRecord) => [record.canonicalPath, JSON.stringify(record)]));
let added = 0;
let updated = 0;
let unchanged = 0;
for (const record of records) {
  const previousRecord = previousByPath.get(record.canonicalPath);
  if (!previousRecord) added += 1;
  else if (previousRecord === JSON.stringify(record)) unchanged += 1;
  else updated += 1;
}

console.log(`Business Sorted programmatic SEO sync complete.`);
console.log(`Added ${added}`);
console.log(`Updated ${updated}`);
console.log(`Unchanged ${unchanged}`);
console.log(`Rejected ${source.rejected.length}`);
console.log(`Wrote ${outputPath}`);
