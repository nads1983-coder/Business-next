"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { comparisonPath } from "@/content/authority";
import { resourcePath } from "@/content/resources";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Choice = "yes" | "no" | "unsure";

const defaultAnswers = {
  limitedCompany: "unsure" as Choice,
  employees: "unsure" as Choice,
  vatConcern: "unsure" as Choice,
  selfEmployed: "unsure" as Choice
};

export function DecisionTools() {
  const [answers, setAnswers] = useState(defaultAnswers);

  const result = useMemo(() => {
    const tasks: { title: string; reason: string; href: string }[] = [];

    if (answers.limitedCompany === "yes") {
      tasks.push({
        title: "Check Companies House filing dates",
        reason: "Limited companies normally need to manage Companies House records, accounts and confirmation statements.",
        href: resourcePath("companies-house-guide")
      });
      tasks.push({
        title: "Check Corporation Tax dates",
        reason: "Active companies usually need to understand Corporation Tax payment and return timing.",
        href: resourcePath("corporation-tax-guide")
      });
    }

    if (answers.employees === "yes") {
      tasks.push({
        title: "Review PAYE responsibilities",
        reason: "Employers usually need payroll records and reporting before or when people are paid.",
        href: resourcePath("paye-guide")
      });
    }

    if (answers.vatConcern === "yes" || answers.vatConcern === "unsure") {
      tasks.push({
        title: "Check VAT registration guidance",
        reason: "VAT depends on taxable turnover and the official registration rules, so it is worth checking early.",
        href: resourcePath("vat-guide")
      });
    }

    if (answers.selfEmployed === "yes") {
      tasks.push({
        title: "Check Self Assessment duties",
        reason: "Self-employed income is commonly reported through Self Assessment.",
        href: resourcePath("self-assessment-guide")
      });
    }

    if (!tasks.length) {
      tasks.push({
        title: "Start with the business deadline calendar",
        reason: "Your answers do not point to a specific filing yet, so build a general deadline map first.",
        href: resourcePath("business-deadline-calendar")
      });
    }

    return tasks;
  }, [answers]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <CardHeader>
          <CardTitle>Which deadlines may apply to me?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Question
            id="limitedCompany"
            label="Are you running, or planning to run, a UK limited company?"
            value={answers.limitedCompany}
            onChange={(value) => setAnswers((current) => ({ ...current, limitedCompany: value }))}
          />
          <Question
            id="employees"
            label="Will you pay staff or directors through payroll?"
            value={answers.employees}
            onChange={(value) => setAnswers((current) => ({ ...current, employees: value }))}
          />
          <Question
            id="vatConcern"
            label="Is VAT registration already relevant or uncertain?"
            value={answers.vatConcern}
            onChange={(value) => setAnswers((current) => ({ ...current, vatConcern: value }))}
          />
          <Question
            id="selfEmployed"
            label="Are you self-employed or expecting untaxed business income personally?"
            value={answers.selfEmployed}
            onChange={(value) => setAnswers((current) => ({ ...current, selfEmployed: value }))}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            This tool narrows the next guidance to read. It does not decide your legal, tax or accounting position.
          </p>
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Your next checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.map((task) => (
              <div key={task.title} className="rounded-md border p-4">
                <p className="flex items-start gap-2 text-sm font-medium">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  {task.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{task.reason}</p>
                <Link href={task.href} className="mt-3 inline-flex text-sm font-medium text-primary underline">
                  Read related guide
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
        <Button asChild variant="outline" className="w-full">
          <Link href={comparisonPath("limited-company-vs-sole-trader")}>Compare company and sole trader</Link>
        </Button>
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
          <Label
            key={choice}
            htmlFor={`${id}-${choice}`}
            className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-secondary/50"
          >
            <input
              id={`${id}-${choice}`}
              name={id}
              type="radio"
              value={choice}
              checked={value === choice}
              onChange={() => onChange(choice)}
              className="h-4 w-4"
            />
            <span className="capitalize">{choice}</span>
          </Label>
        ))}
      </div>
    </fieldset>
  );
}
