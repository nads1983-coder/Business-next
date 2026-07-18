"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { resourcePath } from "@/content/resources";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function addMonths(date: Date, months: number) {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()));
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function parseDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function DeadlineCalculators() {
  const [incorporatedOn, setIncorporatedOn] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [vatPeriodEnd, setVatPeriodEnd] = useState("");
  const [payDate, setPayDate] = useState("");

  const results = useMemo(() => {
    const incorporation = parseDate(incorporatedOn);
    const accountingYearEnd = parseDate(yearEnd);
    const vatEnd = parseDate(vatPeriodEnd);
    const payrollDate = parseDate(payDate);

    return {
      confirmationStatement:
        incorporation ? formatDate(addDays(addMonths(incorporation, 12), 14)) : "Enter an incorporation date.",
      corporationTaxPayment:
        accountingYearEnd ? formatDate(addDays(addMonths(accountingYearEnd, 9), 1)) : "Enter an accounting period end.",
      companyTaxReturn:
        accountingYearEnd ? formatDate(addMonths(accountingYearEnd, 12)) : "Enter an accounting period end.",
      vatReturn:
        vatEnd ? formatDate(addMonths(vatEnd, 1)) : "Enter a VAT period end.",
      payeReminder:
        payrollDate ? formatDate(payrollDate) : "Enter the date staff or directors are paid."
    };
  }, [incorporatedOn, yearEnd, vatPeriodEnd, payDate]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
            Companies House and Corporation Tax dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="incorporatedOn">Company incorporation date</Label>
            <Input id="incorporatedOn" type="date" value={incorporatedOn} onChange={(event) => setIncorporatedOn(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="yearEnd">Accounting period end</Label>
            <Input id="yearEnd" type="date" value={yearEnd} onChange={(event) => setYearEnd(event.target.value)} />
          </div>
          <Result label="Indicative confirmation statement reminder" value={results.confirmationStatement} />
          <Result label="Indicative Corporation Tax payment reminder" value={results.corporationTaxPayment} />
          <Result label="Indicative Company Tax Return reminder" value={results.companyTaxReturn} />
          <p className="text-xs leading-5 text-muted-foreground">
            Method: this tool adds 12 months plus 14 days for a first confirmation statement planning reminder, 9 months and 1 day for a Corporation Tax payment planning reminder, and 12 months for a Company Tax Return planning reminder. Always confirm official dates in Companies House and HMRC accounts.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
            VAT and PAYE planning reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="vatPeriodEnd">VAT period end</Label>
            <Input id="vatPeriodEnd" type="date" value={vatPeriodEnd} onChange={(event) => setVatPeriodEnd(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="payDate">Next pay date</Label>
            <Input id="payDate" type="date" value={payDate} onChange={(event) => setPayDate(event.target.value)} />
          </div>
          <Result label="Indicative VAT return preparation point" value={results.vatReturn} />
          <Result label="PAYE report planning point" value={results.payeReminder} />
          <p className="text-xs leading-5 text-muted-foreground">
            Method: VAT return dates depend on the VAT account and scheme. This uses one month after period end as a planning point only. PAYE reporting is commonly handled on or before pay day, so this tool treats pay day as the reminder point.
          </p>
        </CardContent>
      </Card>

      <section className="rounded-md border bg-secondary/30 p-5 lg:col-span-2">
        <h2 className="text-xl font-semibold tracking-normal">Assumptions and next steps</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          These calculators create planning reminders, not legal or accounting advice. Official accounts can show different dates because of company history, accounting periods, VAT schemes or HMRC notices.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href={resourcePath("business-deadline-calendar")}>Read deadline calendar guide</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Create personalised reminders</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background p-4" aria-live="polite">
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
