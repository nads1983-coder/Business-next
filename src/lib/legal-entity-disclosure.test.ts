import { describe, expect, it } from "vitest";
import { productConfig } from "@/config/product";
import { legalPages } from "@/lib/legal-content";
import { organizationSchema } from "@/lib/seo";

const approvedDisclosure =
  "BusinessSorted.uk is a trading name of Nadine Pierre Ltd. All services provided through BusinessSorted.uk are operated by Nadine Pierre Ltd, a company registered in England and Wales.";

function flattenedSectionText(page: (typeof legalPages)[keyof typeof legalPages]) {
  return page.sections
    .flatMap(([, body]) => (Array.isArray(body) ? body : [body]))
    .join("\n");
}

describe("BusinessSorted legal entity disclosure", () => {
  it("keeps the approved trading-name disclosure exact in shared product config", () => {
    expect(productConfig.tradingNameDisclosure).toBe(approvedDisclosure);
  });

  it("renders the approved disclosure in the required legal policies", () => {
    for (const page of [legalPages.terms, legalPages.privacy, legalPages.subscription, legalPages.refunds]) {
      expect(flattenedSectionText(page)).toContain(approvedDisclosure);
    }
  });

  it("identifies Nadine Pierre Ltd as the legal organisation in structured data", () => {
    expect(organizationSchema()).toMatchObject({
      name: "Nadine Pierre Ltd",
      legalName: "Nadine Pierre Ltd",
      alternateName: ["BusinessSorted.uk", "Business Sorted"]
    });
  });
});
