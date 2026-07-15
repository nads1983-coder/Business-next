import "server-only";

import { redirect } from "next/navigation";
import type { BillingSubscriptionStatus, EntitlementKind, Prisma } from "@prisma/client";
import { billingConfig } from "@/config/billing";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const activePaidStatuses = new Set<BillingSubscriptionStatus>(["ACTIVE", "TRIALING"]);
const recoverableStatuses = new Set<BillingSubscriptionStatus>(["PAST_DUE", "INCOMPLETE", "UNPAID"]);

export type ProductAccess = {
  allowed: boolean;
  source: EntitlementKind | "BILLING_NOT_LIVE" | "NONE";
  message: string;
};

export async function getProductAccess(userId: string): Promise<ProductAccess> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      entitlements: {
        where: { status: "ACTIVE", OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] },
        orderBy: { createdAt: "desc" }
      },
      subscriptions: {
        orderBy: { updatedAt: "desc" },
        take: 1
      }
    }
  });

  if (!user) {
    return { allowed: false, source: "NONE", message: "We could not find this account." };
  }

  if (user.role === "ADMIN") {
    return { allowed: true, source: "ADMIN", message: "Administrator access is active." };
  }

  const explicit = user.entitlements.find((entitlement) =>
    ["FOUNDER", "COMPLIMENTARY", "TRIAL", "PAID"].includes(entitlement.kind)
  );
  if (explicit) {
    return {
      allowed: true,
      source: explicit.kind,
      message:
        explicit.kind === "FOUNDER" || explicit.kind === "COMPLIMENTARY"
          ? "Your founder access is active."
          : "Your subscription access is active."
    };
  }

  const subscription = user.subscriptions[0];
  if (subscription && activePaidStatuses.has(subscription.billingStatus)) {
    return {
      allowed: true,
      source: subscription.billingStatus === "TRIALING" ? "TRIAL" : "PAID",
      message: "Your subscription is active."
    };
  }

  if (!billingConfig.plan.checkoutEnabled) {
    return {
      allowed: false,
      source: "BILLING_NOT_LIVE",
      message: "Billing is not live yet. Founder access is required for the protected product."
    };
  }

  if (subscription && recoverableStatuses.has(subscription.billingStatus)) {
    return {
      allowed: false,
      source: "NONE",
      message: "Your subscription needs attention before product access can continue."
    };
  }

  return {
    allowed: false,
    source: "NONE",
    message: "Choose a plan to continue using Business Sorted."
  };
}

export async function requireProductAccess() {
  const user = await requireUser();
  const access = await getProductAccess(user.id);

  if (!access.allowed) {
    redirect("/app/billing");
  }

  return { user, access };
}

export async function grantFounderAccess({
  userId,
  reason,
  source,
  grantedById
}: {
  userId: string;
  reason: string;
  source: string;
  grantedById?: string | null;
}) {
  const prisma = getPrisma();
  return prisma.userEntitlement.upsert({
    where: {
      userId_kind_source: {
        userId,
        kind: "FOUNDER",
        source
      }
    },
    create: {
      userId,
      kind: "FOUNDER",
      reason,
      source,
      grantedById
    },
    update: {
      status: "ACTIVE",
      reason,
      grantedById,
      endsAt: null
    }
  });
}

export async function recordBillingEvent({
  userId,
  type,
  summary,
  stripeEventId,
  stripeCustomerId,
  stripeSubscriptionId,
  metadata
}: {
  userId?: string | null;
  type: Prisma.BillingEventCreateInput["type"];
  summary: string;
  stripeEventId?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  await getPrisma().billingEvent.create({
    data: {
      userId,
      type,
      summary,
      stripeEventId,
      stripeCustomerId,
      stripeSubscriptionId,
      metadata
    }
  });
}
