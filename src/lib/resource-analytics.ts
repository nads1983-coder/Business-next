export const resourceAnalyticsEvents = {
  resourceViewed: "resource_viewed",
  resourceCategoryViewed: "resource_category_viewed",
  resourceArticleViewed: "resource_article_viewed",
  resourceCtaClicked: "resource_cta_clicked",
  resourceRelatedArticleClicked: "resource_related_article_clicked",
  resourceProductLinkClicked: "resource_product_link_clicked",
  resourceRegistrationClicked: "resource_registration_clicked",
  resourcePricingClicked: "resource_pricing_clicked",
  resourceNavigationLinkClicked: "resource_navigation_link_clicked",
  resourceSourceClicked: "resource_source_clicked"
} as const;

export type ResourceAnalyticsEventName =
  (typeof resourceAnalyticsEvents)[keyof typeof resourceAnalyticsEvents];

export type ResourceDestinationType =
  | "app"
  | "external_source"
  | "homepage"
  | "login"
  | "pricing"
  | "registration"
  | "resource"
  | "support"
  | "unknown";

export type ResourceAnalyticsProps = Record<string, string | number | boolean | undefined>;

export function getResourceDestinationType(href: string): ResourceDestinationType {
  if (href === "/") return "homepage";
  if (href === "/register") return "registration";
  if (href === "/pricing") return "pricing";
  if (href === "/login") return "login";
  if (href === "/support") return "support";
  if (href.startsWith("/resources")) return "resource";
  if (href.startsWith("/app")) return "app";
  if (href.startsWith("https://www.gov.uk") || href.startsWith("https://find-and-update.company-information.service.gov.uk")) {
    return "external_source";
  }
  return "unknown";
}

export function getResourceClickEventName(href: string): ResourceAnalyticsEventName {
  const destinationType = getResourceDestinationType(href);

  if (destinationType === "registration") return resourceAnalyticsEvents.resourceRegistrationClicked;
  if (destinationType === "pricing") return resourceAnalyticsEvents.resourcePricingClicked;
  if (destinationType === "external_source") return resourceAnalyticsEvents.resourceSourceClicked;
  if (destinationType === "resource") return resourceAnalyticsEvents.resourceRelatedArticleClicked;

  return resourceAnalyticsEvents.resourceProductLinkClicked;
}

export function getSourceDomain(href: string) {
  try {
    return new URL(href).hostname;
  } catch {
    return undefined;
  }
}
