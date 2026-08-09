import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionId, productRedirectUrl, validateMtdCheckoutSession } from "@/lib/mtd-delivery";
import { MtdDeliveryContent } from "@/components/mtd-offers";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your MTD Starter Pack | Business Sorted",
  robots: { index: false, follow: false }
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MtdStarterPackDeliveryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const validation = await validateMtdCheckoutSession({
    pack: "starter",
    sessionId: getSessionId(params)
  });

  if (!validation.ok) {
    redirect(productRedirectUrl("starter", validation.reason));
  }

  return (
    <PublicPage>
      <section className="max-w-3xl">
        <Badge variant="calm">Purchase complete</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">Your MTD Starter Pack is ready</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Thanks for buying from Business Sorted. Your pack is below so there is no login, waiting room or manual delivery step.
        </p>
      </section>
      <section className="mt-10">
        <MtdDeliveryContent kit="starter" />
      </section>
    </PublicPage>
  );
}
