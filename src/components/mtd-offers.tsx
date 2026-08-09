import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, FileSpreadsheet } from "lucide-react";
import { mtdProducts } from "@/content/mtd-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MtdOfferCards() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {Object.values(mtdProducts).map((product) => (
        <Card key={product.href}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3 text-xl">
              <span>{product.name}</span>
              <span className="text-base font-semibold text-primary">{product.price}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-6 text-muted-foreground">{product.description}</p>
            <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
              {product.includes.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href={product.checkoutUrl}>
                  Buy now <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href={product.href}>View details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function MtdDeliveryContent({ kit }: { kit: "starter" | "setup" }) {
  const isSetup = kit === "setup";
  const sections = [
    {
      title: "1. MTD readiness checklist",
      items: [
        "Confirm whether your income is self-employment, property, or both.",
        "Check whether your qualifying income is over £50,000, £30,000 or £20,000.",
        "Confirm whether you are registered for Self Assessment.",
        "Check whether you already use MTD-compatible software.",
        "Make a quarterly routine for income, expenses, receipts and bank records."
      ]
    },
    {
      title: "2. Quarterly update routine",
      items: [
        "Week 1 after month end: reconcile bank transactions and cash income.",
        "Week 2: attach receipts and categorise expenses.",
        "Week 3: review unusual items and missing records.",
        "Quarter end: check the software submission flow and keep a copy of the submitted figures."
      ]
    },
    {
      title: "3. Expense categories to prepare",
      items: [
        "Software, professional fees, phone, internet, stationery and bank charges.",
        "Travel, mileage, insurance, repairs and replacement items.",
        "For landlords: rent received, agent fees, repairs, mortgage interest records and property insurance.",
        "For sole traders: sales income, platform fees, materials, subcontractors and home-working records."
      ]
    },
    {
      title: "4. Accountant email template",
      items: [
        "Ask whether MTD applies to your current qualifying income.",
        "Ask which software or bridging software they prefer.",
        "Ask whether they will submit quarterly updates or only review your records.",
        "Ask what records they want you to keep monthly so year-end work is faster."
      ]
    }
  ];

  const setupOnly = [
    {
      title: "5. Digital record keeping system",
      items: [
        "Create folders by tax year, then by quarter.",
        "Use file names in this format: YYYY-MM-DD_supplier_amount_category.",
        "Keep bank statements, invoices, receipts and software exports in separate folders.",
        "Review missing documents at month end, not quarter end."
      ]
    },
    {
      title: "6. MTD software chooser",
      items: [
        "Choose full bookkeeping software if your records are messy or high volume.",
        "Choose bridging software only if your spreadsheet process is already clean and repeatable.",
        "Check accountant access, bank feeds, receipt capture, property income support and export options.",
        "Avoid changing systems in the month your first quarterly update is due."
      ]
    }
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-md border bg-secondary/30 p-5">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-semibold tracking-normal">
              Your {isSetup ? "MTD Setup Kit" : "MTD Starter Pack"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Keep this page bookmarked. It is intentionally plain so it is easy to print, save as PDF, or copy into your own records.
            </p>
          </div>
        </div>
      </div>

      {[...sections, ...(isSetup ? setupOnly : [])].map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      <div className="rounded-md border p-5">
        <h2 className="text-lg font-semibold tracking-normal">Save a copy</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use your browser print command and choose &quot;Save as PDF&quot; if you want an offline copy. This avoids account logins and keeps delivery hands-off.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/making-tax-digital-checker">
            Return to checker <Download className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
