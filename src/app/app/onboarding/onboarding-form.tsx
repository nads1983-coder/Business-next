"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { completeOnboardingAction } from "./actions";
import { onboardingQuestions } from "@/lib/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Answers = Record<string, string>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Check className="h-4 w-4" aria-hidden="true" />
      {pending ? "Saving..." : "Finish setup"}
    </Button>
  );
}

export function OnboardingForm() {
  const [state, formAction] = useActionState(completeOnboardingAction, null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    businessType: "NOT_SURE",
    legalBusinessName: "",
    tradingName: "",
    companyNumber: "",
    startedTradingOn: "",
    companyRegisteredOn: "",
    firstAccountingPeriodEnd: "",
    registeredForVat: "NOT_SURE",
    vatRegisteredOn: "",
    vatPeriodEndsOn: "",
    employsPeople: "NOT_SURE",
    firstPayday: "",
    usesAccountant: "NOT_SURE",
    wantsEmailReminders: "YES",
    salesSoFar: "0",
    costsSoFar: "0",
    canUpdateLater: "YES"
  });
  const visibleQuestions = useMemo(
    () =>
      onboardingQuestions.filter((item) => {
        if ("businessTypes" in item && item.businessTypes) {
          if (!item.businessTypes.includes(answers.businessType as never)) return false;
        }
        if ("requires" in item && item.requires) {
          if (answers[item.requires.id] !== item.requires.value) return false;
        }
        return true;
      }),
    [answers]
  );
  const question = visibleQuestions[Math.min(step, visibleQuestions.length - 1)];
  const progress = useMemo(
    () => Math.round(((step + 1) / visibleQuestions.length) * 100),
    [step, visibleQuestions.length]
  );

  function updateAnswer(value: string) {
    setAnswers((current) => ({
      ...current,
      [question.id]: value
    }));
  }

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-6">
      {Object.entries(answers).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {step + 1} of {visibleQuestions.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{question.label}</CardTitle>
          <CardDescription>{question.help}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {question.type === "choice" ? (
            <div className="grid gap-3">
              {question.options.map((option) => (
                <Label
                  key={option.value}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border p-3 text-sm hover:bg-secondary"
                >
                  <input
                    type="radio"
                    name={`${question.id}-visible`}
                    value={option.value}
                    checked={answers[question.id] === option.value}
                    onChange={() => updateAnswer(option.value)}
                    className="h-4 w-4 accent-primary"
                  />
                  {option.label}
                </Label>
              ))}
            </div>
          ) : null}

          {question.type === "date" ? (
            <Input
              type="date"
              aria-label={question.label}
              value={answers[question.id] ?? ""}
              onChange={(event) => updateAnswer(event.target.value)}
            />
          ) : null}

          {question.type === "text" ? (
            <div className="space-y-2">
              <Label htmlFor={question.id}>{question.label}</Label>
              <Input
                id={question.id}
                type="text"
                value={answers[question.id] ?? ""}
                onChange={(event) => updateAnswer(event.target.value)}
              />
            </div>
          ) : null}

          {question.type === "month" ? (
            <select
              value={answers[question.id] ?? ""}
              onChange={(event) => updateAnswer(event.target.value)}
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">I am not sure</option>
              {Array.from({ length: 12 }, (_, index) => (
                <option value={index + 1} key={index + 1}>
                  {new Date(2026, index, 1).toLocaleString("en-GB", { month: "long" })}
                </option>
              ))}
            </select>
          ) : null}

          {question.type === "money" ? (
            <div className="space-y-2">
              <Label htmlFor={question.id}>Amount in pounds</Label>
              <Input
                id={question.id}
                type="number"
                min="0"
                step="1"
                value={answers[question.id] ?? "0"}
                onChange={(event) => updateAnswer(event.target.value)}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {state?.message ? <p className="text-sm text-destructive">{state.message}</p> : null}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        {step < visibleQuestions.length - 1 ? (
          <Button
            type="button"
            onClick={() =>
              setStep((current) => Math.min(visibleQuestions.length - 1, current + 1))
            }
          >
            Next
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <SubmitButton />
        )}
      </div>
    </form>
  );
}
