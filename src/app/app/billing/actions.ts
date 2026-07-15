"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { billingConfig, isControlledBillingTestUser } from "@/config/billing";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createCheckoutSession, createCustomerPortalSession } from "@/lib/stripe-billing";

const checkoutSchema = z.object({
  interval: z.enum(["monthly", "annual"]).default("monthly"),
  acceptTerms: z.literal("on"),
  acceptPrivacy: z.literal("on"),
  acceptSubscriptionTerms: z.literal("on")
});

export async function startCheckoutAction(formData: FormData) {
  const user = await requireUser();

  if (!billingConfig.plan.checkoutEnabled) {
    redirect("/pricing?billing=not-ready");
  }
  if (!isControlledBillingTestUser(user.email)) {
    redirect("/pricing?billing=controlled-test");
  }

  const prisma = getPrisma();
  const billingUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, emailVerified: true }
  });

  if (!billingUser?.emailVerified || !isControlledBillingTestUser(billingUser.email)) {
    redirect("/pricing?billing=controlled-test");
  }

  const parsed = checkoutSchema.parse({
    interval: formData.get("interval") ?? "monthly",
    acceptTerms: formData.get("acceptTerms"),
    acceptPrivacy: formData.get("acceptPrivacy"),
    acceptSubscriptionTerms: formData.get("acceptSubscriptionTerms")
  });

  await prisma.$transaction([
    prisma.legalAcceptance.upsert({
      where: {
        userId_document_version: {
          userId: user.id,
          document: "TERMS_OF_USE",
          version: billingConfig.legal.termsVersion
        }
      },
      create: {
        userId: user.id,
        document: "TERMS_OF_USE",
        version: billingConfig.legal.termsVersion,
        source: "checkout"
      },
      update: {}
    }),
    prisma.legalAcceptance.upsert({
      where: {
        userId_document_version: {
          userId: user.id,
          document: "PRIVACY_NOTICE",
          version: billingConfig.legal.privacyVersion
        }
      },
      create: {
        userId: user.id,
        document: "PRIVACY_NOTICE",
        version: billingConfig.legal.privacyVersion,
        source: "checkout"
      },
      update: {}
    }),
    prisma.legalAcceptance.upsert({
      where: {
        userId_document_version: {
          userId: user.id,
          document: "SUBSCRIPTION_TERMS",
          version: billingConfig.legal.subscriptionTermsVersion
        }
      },
      create: {
        userId: user.id,
        document: "SUBSCRIPTION_TERMS",
        version: billingConfig.legal.subscriptionTermsVersion,
        source: "checkout"
      },
      update: {}
    })
  ]);

  const url = await createCheckoutSession({
    user: { ...user, email: billingUser.email },
    interval: parsed.interval
  });

  if (!url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }

  redirect(url);
}

export async function openBillingPortalAction() {
  const user = await requireUser();
  const url = await createCustomerPortalSession(user.id);
  redirect(url);
}
