export const amazonAffiliateConfig = {
  amazonUkBaseUrl: "https://www.amazon.co.uk",
  storeId: "npierreltd1-21",
  disclosure:
    "As an Amazon Associate, Nadine Pierre LTD earns from qualifying purchases. This does not affect the price you pay.",
  linkRel: "sponsored nofollow noopener noreferrer",
  target: "_blank"
} as const;

export function amazonUkSearchUrl(query: string) {
  const url = new URL("/s", amazonAffiliateConfig.amazonUkBaseUrl);
  url.searchParams.set("k", query);
  url.searchParams.set("tag", amazonAffiliateConfig.storeId);
  return url.toString();
}
