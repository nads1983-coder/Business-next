"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, ArrowRight, Check, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { completeOnboardingAction } from "./actions";
import { onboardingQuestions } from "@/lib/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompaniesHouseLookup } from "@/components/companies-house-lookup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Answers = Record<string, string>;

const initialAnswers: Answers = {
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
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Check className="h-4 w-4" aria-hidden="true" />
      {pending ? "Saving..." : "Finish setup"}
    </Button>
  );
}

export function OnboardingForm({ draftStorageKey }: { draftStorageKey: string }) {
  const [state, formAction] = useActionState(completeOnboardingAction, null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [confirmedCompaniesHouseNumber, setConfirmedCompaniesHouseNumber] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
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
  const completedVisible = visibleQuestions.filter((item) => {
    const value = answers[item.id];
    return value !== undefined && value !== "";
  }).length;
  const progress = useMemo(
    () => Math.round((completedVisible / visibleQuestions.length) * 100),
    [completedVisible, visibleQuestions.length]
  );
  const isOptional = "optional" in question && question.optional;

  useEffect(() => {
    const saved = window.localStorage.getItem(draftStorageKey);
    window.setTimeout(() => {
      if (saved) {
        try {
          setAnswers((current) => ({ ...current, ...JSON.parse(saved) }));
        } catch {
          window.localStorage.removeItem(draftStorageKey);
        }
      }
      setDraftLoaded(true);
    }, 0);
  }, [draftStorageKey]);

  useEffect(() => {
    if (draftLoaded) {
      window.localStorage.setItem(draftStorageKey, JSON.stringify(answers));
    }
  }, [answers, draftLoaded, draftStorageKey]);

  function updateAnswer(value: string) {
    setAnswers((current) => ({
      ...current,
      [question.id]: value
    }));
    if (question.id === "companyNumber" && value.replace(/\s+/g, "").toUpperCase() !== confirmedCompaniesHouseNumber) {
      setConfirmedCompaniesHouseNumber("");
    }
  }

  function updateAnswers(values: Answers) {
    setAnswers((current) => ({
      ...current,
      ...values
    }));
  }

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-6">
      {Object.entries(answers).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <input type="hidden" name="companiesHouseConfirmedCompanyNumber" value={confirmedCompaniesHouseNumber} />
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Your first deadline list is close</p>
            <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
              {completedVisible} of {visibleQuestions.length} answers added. Draft saved on this device.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              About 2 minutes
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              You can change this later
            </span>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-muted" aria-hidden="true">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-md bg-secondary p-2 text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Question {step + 1} of {visibleQuestions.length}
              </p>
              <CardTitle className="mt-1 leading-tight">{question.label}</CardTitle>
            </div>
          </div>
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
              {question.id === "companyNumber" ? (
                <CompaniesHouseLookup
                  initialCompanyNumber={answers.companyNumber}
                  onConfirm={(preview) => {
                    setConfirmedCompaniesHouseNumber(preview.companyNumber);
                    updateAnswers({
                      companyNumber: preview.companyNumber,
                      legalBusinessName: preview.companyName,
                      companyRegisteredOn: preview.incorporatedOn ?? "",
                      businessYearEndMonth: preview.accountingReferenceMonth
                        ? String(preview.accountingReferenceMonth)
                        : answers.businessYearEndMonth
                    });
                  }}
                />
              ) : null}
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          {isOptional ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                updateAnswer("");
                setStep((current) => Math.min(visibleQuestions.length - 1, current + 1));
              }}
            >
              Skip for now
            </Button>
          ) : null}
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
      </div>
    </form>
  );
}
