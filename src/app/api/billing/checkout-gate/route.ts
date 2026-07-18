import { NextResponse } from "next/server";
import { billingConfig, getCheckoutGateDiagnostics } from "@/config/billing";
import { legalVersion } from "@/config/legal";

export const dynamic = "force-dynamic";

export function GET() {
  const diagnostics = getCheckoutGateDiagnostics();

  return NextResponse.json(
    {
      ready: diagnostics.ready,
      failingCategories: diagnostics.failingCategories,
      plan: {
        name: billingConfig.plan.name,
        currency: billingConfig.plan.currency,
        displayPrice: billingConfig.plan.displayPrice,
        monthlyPricePence: billingConfig.plan.monthlyPricePence,
        annualEnabled: billingConfig.plan.annualEnabled,
        trialDays: billingConfig.plan.trialDays ?? null,
        stripeMode: billingConfig.plan.stripeMode
      },
      legalVersion,
      checkoutRestrictedToApprovedOwner: false
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
