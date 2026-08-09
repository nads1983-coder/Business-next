import type { Metadata } from "next";
import { MtdDeliveryContent } from "@/components/mtd-offers";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Your MTD Starter Pack | Business Sorted",
  robots: { index: false, follow: false }
};

export default function MtdStarterPackSuccessPage() {
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
