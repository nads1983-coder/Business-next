import type { Metadata } from "next";
import { MtdDeliveryContent } from "@/components/mtd-offers";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Your MTD Setup Kit | Business Sorted",
  robots: { index: false, follow: false }
};

export default function MtdSetupKitDeliveryPage() {
  return (
    <PublicPage>
      <section className="max-w-3xl">
        <Badge variant="calm">Purchase complete</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">Your MTD Setup Kit is ready</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Thanks for buying from Business Sorted. Your setup kit is below so the delivery path stays instant and hands-off.
        </p>
      </section>
      <section className="mt-10">
        <MtdDeliveryContent kit="setup" />
      </section>
    </PublicPage>
  );
}
