import type { AnalyticsEventName, Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export const analyticsEvents = {
  pricingPageViewed: "PRICING_PAGE_VIEWED",
  checkoutStarted: "CHECKOUT_STARTED",
  checkoutCancelled: "CHECKOUT_CANCELLED",
  subscriptionActivated: "SUBSCRIPTION_ACTIVATED",
  customerPortalOpened: "CUSTOMER_PORTAL_OPENED",
  cancellationScheduled: "CANCELLATION_SCHEDULED",
  subscriptionEnded: "SUBSCRIPTION_ENDED"
} as const satisfies Record<string, AnalyticsEventName>;

export async function recordAnalyticsEvent({
  userId,
  name,
  path,
  metadata
}: {
  userId?: string | null;
  name: AnalyticsEventName;
  path?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await getPrisma().analyticsEvent.create({
    data: {
      userId,
      name,
      path,
      metadata
    }
  });
}
