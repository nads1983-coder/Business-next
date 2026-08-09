"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, FileSpreadsheet, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Choice = "yes" | "no" | "unsure";
type IncomeType = "sole-trader" | "landlord" | "both" | "neither" | "unsure";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0
});

function parseIncome(value: string) {
  const numeric = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function startDateForIncome(income: number) {
  if (income > 50000) {
    return {
      status: "likely" as const,
      date: "6 April 2026",
      reason: "Your qualifying income is over the GBP 50,000 phase-one threshold."
    };
  }

  if (income > 30000) {
    return {
      status: "soon" as const,
      date: "6 April 2027",
      reason: "Your qualifying income is over the GBP 30,000 phase-two threshold."
    };
  }

  if (income > 20000) {
    return {
      status: "later" as const,
      date: "6 April 2028",
      reason: "Your qualifying income is over the GBP 20,000 phase-three threshold."
    };
  }

  return {
    status: "not-yet" as const,
    date: "not yet based on these figures",
    reason: "Your qualifying income is not over the current published thresholds."
  };
}

export function MakingTaxDigitalChecker() {
  const [incomeType, setIncomeType] = useState<IncomeType>("unsure");
  const [income, setIncome] = useState("50000");
  const [registeredForSelfAssessment, setRegisteredForSelfAssessment] = useState<Choice>("unsure");
  const [submittedReturn, setSubmittedReturn] = useState<Choice>("unsure");
  const [usesSoftware, setUsesSoftware] = useState<Choice>("unsure");
  const [usesSpreadsheets, setUsesSpreadsheets] = useState<Choice>("unsure");

  const result = useMemo(() => {
    const qualifyingIncome = parseIncome(income);
    const thresholdResult = startDateForIncome(qualifyingIncome);
    const hasRelevantIncome = incomeType === "sole-trader" || incomeType === "landlord" || incomeType === "both";
    const mayHaveRelevantIncome = incomeType === "unsure";
    const notRegistered = registeredForSelfAssessment === "no";
    const firstReturnMissing = submittedReturn === "no" || submittedReturn === "unsure";
    const needsPrep = usesSoftware !== "yes" || usesSpreadsheets === "yes" || usesSpreadsheets === "unsure";

    if (incomeType === "neither") {
      return {
        title: "MTD for Income Tax probably does not apply from these answers",
        tone: "not-yet" as const,
        summary: "The current MTD Income Tax rules are aimed at sole traders and landlords with qualifying self-employment or property income.",
        next: [
          "Check whether any self-employment or property income still needs to be reported through Self Assessment.",
          "Keep this page bookmarked if your income changes or you start letting property."
        ]
      };
    }

    if (mayHaveRelevantIncome || notRegistered) {
      return {
        title: "You need to check your Self Assessment position first",
        tone: "review" as const,
        summary:
          "MTD for Income Tax depends on whether you are a sole trader or landlord registered for Self Assessment and have qualifying income over the relevant threshold.",
        next: [
          "Confirm whether you need to send a Self Assessment return.",
          "Separate employment income from self-employment and property income.",
          "Use the GOV.UK checker before choosing software."
        ]
      };
    }

    if (!hasRelevantIncome) {
      return {
        title: "MTD for Income Tax is unclear from these answers",
        tone: "review" as const,
        summary: "The tool needs to know whether your income is from self-employment, property, or both.",
        next: ["Confirm your income type.", "Check your latest Self Assessment return and HMRC notices."]
      };
    }

    const next = [
      `Check whether your qualifying income is really ${formatCurrency(qualifyingIncome)} after excluding income that does not count for MTD Income Tax.`,
      "Choose MTD-compatible software or ask your accountant how they will handle digital records and quarterly updates.",
      "Create a quarterly routine for income, expenses, receipts and bank records."
    ];

    if (firstReturnMissing) {
      next.unshift("Submit your first Self Assessment tax return before assuming your exact MTD start date.");
    }

    if (needsPrep) {
      next.push("If you currently use spreadsheets, check whether you need bridging software or a full accounting app.");
    }

    return {
      title: `You may need Making Tax Digital from ${thresholdResult.date}`,
      tone: thresholdResult.status === "likely" ? ("urgent" as const) : ("review" as const),
      summary: thresholdResult.reason,
      next
    };
  }, [income, incomeType, registeredForSelfAssessment, submittedReturn, usesSoftware, usesSpreadsheets]);

  const Icon = result.tone === "urgent" ? AlertCircle : result.tone === "not-yet" ? CheckCircle2 : Clock;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <Card>
        <CardHeader>
          <CardTitle>Check your likely MTD start date</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">What income are you checking?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["sole-trader", "Sole trader"],
                ["landlord", "Landlord"],
                ["both", "Both"],
                ["neither", "Neither"],
                ["unsure", "Not sure"]
              ].map(([value, label]) => (
                <RadioOption
                  key={value}
                  name="incomeType"
                  value={value}
                  label={label}
                  checked={incomeType === value}
                  onChange={() => setIncomeType(value as IncomeType)}
                />
              ))}
            </div>
          </fieldset>

          <div className="grid gap-2">
            <Label htmlFor="qualifyingIncome">Estimated self-employment and property income</Label>
            <Input
              id="qualifyingIncome"
              inputMode="numeric"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
              aria-describedby="qualifyingIncomeHelp"
            />
            <p id="qualifyingIncomeHelp" className="text-xs leading-5 text-muted-foreground">
              Use total qualifying income from self-employment, property, or both. This is a planning check, not a tax calculation.
            </p>
          </div>

          <Question
            id="registeredForSelfAssessment"
            label="Are you registered for Self Assessment?"
            value={registeredForSelfAssessment}
            onChange={setRegisteredForSelfAssessment}
          />
          <Question
            id="submittedReturn"
            label="Have you already submitted at least one Self Assessment tax return?"
            value={submittedReturn}
            onChange={setSubmittedReturn}
          />
          <Question
            id="usesSoftware"
            label="Do you already use accounting software?"
            value={usesSoftware}
            onChange={setUsesSoftware}
          />
          <Question
            id="usesSpreadsheets"
            label="Do you mainly use spreadsheets or manual records?"
            value={usesSpreadsheets}
            onChange={setUsesSpreadsheets}
          />
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start gap-2">
              <Icon className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
              {result.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">{result.summary}</p>
            <div className="rounded-md border bg-secondary/30 p-4">
              <p className="text-sm font-medium">Your next steps</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                {result.next.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/register">Create deadline reminders</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="https://www.gov.uk/guidance/find-out-if-and-when-you-need-to-use-making-tax-digital-for-income-tax">
                  Check official GOV.UK guidance
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-5 w-5 text-primary" aria-hidden="true" />
              Spreadsheet users
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            HMRC says MTD users need compatible software. If you keep records in spreadsheets, check whether bridging software is enough or whether a full bookkeeping app is more practical.
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Question({
  id,
  label,
  value,
  onChange
}: {
  id: string;
  label: string;
  value: Choice;
  onChange: (value: Choice) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {(["yes", "no", "unsure"] as const).map((choice) => (
          <RadioOption
            key={choice}
            name={id}
            value={choice}
            label={choice === "unsure" ? "Not sure" : choice[0].toUpperCase() + choice.slice(1)}
            checked={value === choice}
            onChange={() => onChange(choice)}
          />
        ))}
      </div>
    </fieldset>
  );
}

function RadioOption({
  name,
  value,
  label,
  checked,
  onChange
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <Label
      htmlFor={`${name}-${value}`}
      className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-secondary/50"
    >
      <input
        id={`${name}-${value}`}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4"
      />
      <span>{label}</span>
      {value === "unsure" ? <HelpCircle className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden="true" /> : null}
    </Label>
  );
}
