import "server-only";

import Stripe from "stripe";
import { mtdProducts } from "@/content/mtd-products";
import { getStripe } from "@/lib/stripe";

export type MtdPackKey = "starter" | "setup";

type ValidationResult =
  | { ok: true }
  | {
      ok: false;
      reason: "missing" | "invalid" | "unpaid" | "wrong-pack";
    };
type ValidationFailureReason = Exclude<ValidationResult, { ok: true }>["reason"];

export const mtdDeliveryConfig = {
  starter: {
    productPage: mtdProducts.starterPack.href,
    deliveryPath: "/mtd-delivery/starter-9d4f7c2a",
    priceId: "price_1U2SXaFnoS3uqGtrB8VxL3n3",
    productId: "prod_V2XcEqFonhHpTf",
    paymentLinkId: "plink_1U2SY2FnoS3uqGtraeZpf74O"
  },
  setup: {
    productPage: mtdProducts.setupKit.href,
    deliveryPath: "/mtd-delivery/setup-6b8e3f91",
    priceId: "price_1U2SXmFnoS3uqGtrFdikZkSn",
    productId: "prod_V2XcinA3qzIcyW",
    paymentLinkId: "plink_1U2SYFFnoS3uqGtrL8bvaCdQ"
  }
} as const;

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function getSessionId(searchParams: Record<string, string | string[] | undefined>) {
  return firstValue(searchParams.session_id);
}

export function productRedirectUrl(pack: MtdPackKey, reason: ValidationFailureReason) {
  return `${mtdDeliveryConfig[pack].productPage}?delivery=${reason}`;
}

function priceMatchesLineItem(
  lineItem: Stripe.LineItem,
  expected: (typeof mtdDeliveryConfig)[MtdPackKey]
) {
  const price = lineItem.price;
  if (!price || price.id !== expected.priceId) return false;

  const product = price.product;
  const productId = typeof product === "string" ? product : product.id;

  return productId === expected.productId && lineItem.quantity === 1;
}

export async function validateMtdCheckoutSession({
  pack,
  sessionId
}: {
  pack: MtdPackKey;
  sessionId?: string;
}): Promise<ValidationResult> {
  if (!sessionId) {
    return { ok: false, reason: "missing" };
  }
  if (!sessionId.startsWith("cs_")) {
    return { ok: false, reason: "invalid" };
  }

  const expected = mtdDeliveryConfig[pack];

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"]
    });

    if (session.status !== "complete" || session.payment_status !== "paid") {
      return { ok: false, reason: "unpaid" };
    }

    const paymentLinkId =
      typeof session.payment_link === "string" ? session.payment_link : session.payment_link?.id;
    if (paymentLinkId !== expected.paymentLinkId) {
      return { ok: false, reason: "wrong-pack" };
    }

    const lineItems = session.line_items?.data ?? [];
    const hasExpectedItem = lineItems.some((lineItem) => priceMatchesLineItem(lineItem, expected));

    return hasExpectedItem ? { ok: true } : { ok: false, reason: "wrong-pack" };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
