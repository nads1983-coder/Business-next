import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { mtdProducts } from "@/content/mtd-products";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { DeliveryNotice } from "@/components/delivery-notice";
import { MtdOfferCards } from "@/components/mtd-offers";
import { PublicPage } from "@/components/public-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = pageMetadata({
  title: "MTD Setup Kit for Sole Traders and Landlords",
  description:
    "Buy the Business Sorted MTD Setup Kit for UK sole traders and landlords who want a simple digital record keeping workflow.",
  path: "/mtd-setup-kit"
});

export default function MtdSetupKitPage() {
  const product = mtdProducts.setupKit;

  return (
    <PublicPage>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Making Tax Digital checker", path: "/making-tax-digital-checker" },
            { name: product.name, path: product.href }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            brand: { "@type": "Brand", name: "Business Sorted" },
            offers: {
              "@type": "Offer",
              price: "49",
              priceCurrency: "GBP",
              availability: "https://schema.org/InStock",
              url: product.checkoutUrl
            }
          }
        ]}
      />
      <section className="max-w-3xl">
        <DeliveryNotice />
        <Badge variant="calm">Digital download</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal">MTD Setup Kit</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{product.description}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href={product.checkoutUrl}>
              Buy for {product.price} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/making-tax-digital-checker">Use the free checker first</Link>
          </Button>
        </div>
      </section>
      <section className="mt-10">
        <MtdOfferCards />
      </section>
    </PublicPage>
  );
}
