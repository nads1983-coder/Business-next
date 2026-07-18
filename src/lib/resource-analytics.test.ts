import { describe, expect, it } from "vitest";
import {
  getResourceClickEventName,
  getResourceDestinationType,
  getSourceDomain,
  resourceAnalyticsEvents
} from "@/lib/resource-analytics";

describe("resource analytics taxonomy", () => {
  it("uses stable privacy-safe event names", () => {
    expect(Object.values(resourceAnalyticsEvents)).toEqual([
      "resource_viewed",
      "resource_category_viewed",
      "resource_article_viewed",
      "resource_cta_clicked",
      "resource_related_article_clicked",
      "resource_product_link_clicked",
      "resource_registration_clicked",
      "resource_pricing_clicked",
      "resource_navigation_link_clicked",
      "resource_source_clicked"
    ]);
  });

  it("classifies resource conversion destinations without free-text payloads", () => {
    expect(getResourceDestinationType("/register")).toBe("registration");
    expect(getResourceDestinationType("/pricing")).toBe("pricing");
    expect(getResourceDestinationType("/resources/companies-house")).toBe("resource");
    expect(getResourceDestinationType("https://www.gov.uk/annual-accounts")).toBe("external_source");
    expect(getSourceDomain("https://www.gov.uk/annual-accounts")).toBe("www.gov.uk");
  });

  it("maps clicks to one event type per click", () => {
    expect(getResourceClickEventName("/register")).toBe(resourceAnalyticsEvents.resourceRegistrationClicked);
    expect(getResourceClickEventName("/pricing")).toBe(resourceAnalyticsEvents.resourcePricingClicked);
    expect(getResourceClickEventName("/resources/confirmation-statement-guide")).toBe(
      resourceAnalyticsEvents.resourceRelatedArticleClicked
    );
    expect(getResourceClickEventName("https://www.gov.uk/annual-accounts")).toBe(
      resourceAnalyticsEvents.resourceSourceClicked
    );
  });
});
