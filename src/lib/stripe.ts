import "server-only";

import Stripe from "stripe";
import { billingConfig } from "@/config/billing";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required before Stripe can be used.");
  }
  if (billingConfig.plan.stripeMode === "live" && !secretKey.startsWith("sk_live_")) {
    throw new Error("Stripe live mode requires a live secret key.");
  }
  if (billingConfig.plan.stripeMode === "test" && !secretKey.startsWith("sk_test_")) {
    throw new Error("Stripe test mode requires a test secret key.");
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia",
    typescript: true
  });

  return stripeClient;
}

export function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required before Stripe webhooks can be processed.");
  }
  if (!secret.startsWith("whsec_")) {
    throw new Error("STRIPE_WEBHOOK_SECRET must be a Stripe webhook signing secret.");
  }
  return secret;
}
