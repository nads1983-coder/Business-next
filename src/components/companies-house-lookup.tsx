"use client";

import { useState, useTransition } from "react";
import { Building2, CheckCircle2, RefreshCw, Search, TriangleAlert } from "lucide-react";
import {
  connectCompaniesHouseAction,
  lookupCompaniesHouseAction,
  refreshCompaniesHouseAction
} from "@/app/app/companies-house/actions";
import type { CompaniesHousePreview } from "@/lib/companies-house/sync";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResultMessage = {
  ok: boolean;
  text: string;
};

function prettyDate(value: string | null) {
  if (!value) return "Not shown";
  return new Date(`${value}T12:00:00.000Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function statusTone(status: string | null) {
  if (!status) return "outline";
  return status === "active" ? "calm" : "outline";
}

export function CompaniesHouseLookup({
  businessId,
  initialCompanyNumber,
  connectedAt,
  lastSyncedAt,
  onConfirm
}: {
  businessId?: string;
  initialCompanyNumber?: string | null;
  connectedAt?: Date | string | null;
  lastSyncedAt?: Date | string | null;
  onConfirm?: (preview: CompaniesHousePreview) => void;
}) {
  const [companyNumber, setCompanyNumber] = useState(initialCompanyNumber ?? "");
  const [preview, setPreview] = useState<CompaniesHousePreview | null>(null);
  const [message, setMessage] = useState<ResultMessage | null>(null);
  const [useCompaniesHouseValues, setUseCompaniesHouseValues] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isDissolved = preview?.companyStatus === "dissolved";

  function lookup() {
    setMessage(null);
    startTransition(async () => {
      const result = await lookupCompaniesHouseAction({ companyNumber });
      if (!result.ok) {
        setPreview(null);
        setMessage({ ok: false, text: result.message });
        return;
      }
      setCompanyNumber(result.preview.companyNumber);
      setPreview(result.preview);
      setMessage({ ok: true, text: "Company found. Check the details before using them." });
    });
  }

  function confirmPreview() {
    if (!preview) return;
    if (onConfirm) {
      onConfirm(preview);
      setMessage({ ok: true, text: "Companies House details added to this setup draft." });
      return;
    }
    if (!businessId) return;
    startTransition(async () => {
      const result = await connectCompaniesHouseAction({
        businessId,
        companyNumber: preview.companyNumber,
        useCompaniesHouseValues
      });
      setMessage({ ok: result.ok, text: result.ok ? result.message : result.message });
    });
  }

  function refresh() {
    if (!businessId) return;
    startTransition(async () => {
      const result = await refreshCompaniesHouseAction({ businessId });
      setMessage({ ok: result.ok, text: result.ok ? result.message : result.message });
    });
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            Companies House lookup
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your company number and we’ll retrieve the public information held by Companies House.
            You can review it before it is added to your profile.
          </p>
        </div>
        {connectedAt ? <Badge variant="calm">Connected</Badge> : null}
      </div>

      {lastSyncedAt ? (
        <p className="text-xs text-muted-foreground">
          Companies House connected. Last checked: {new Date(lastSyncedAt).toLocaleString("en-GB")}.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label htmlFor="companies-house-number">Company number</Label>
          <Input
            id="companies-house-number"
            value={companyNumber}
            onChange={(event) => setCompanyNumber(event.target.value.toUpperCase())}
            placeholder="e.g. 01234567"
            autoComplete="off"
          />
        </div>
        <Button type="button" className="w-full self-end sm:w-auto" onClick={lookup} disabled={isPending}>
          <Search className="h-4 w-4" aria-hidden="true" />
          {isPending ? "Checking..." : "Check"}
        </Button>
      </div>

      {message ? (
        <p className={message.ok ? "text-sm text-primary" : "text-sm text-destructive"} aria-live="polite">
          {message.text}
        </p>
      ) : null}

      {preview ? (
        <div className="space-y-4 rounded-md border bg-background p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-medium">{preview.companyName}</h3>
              <p className="text-sm text-muted-foreground">{preview.companyNumber}</p>
            </div>
            <Badge variant={statusTone(preview.companyStatus)}>{preview.companyStatus ?? "Status not shown"}</Badge>
          </div>

          {isDissolved ? (
            <p className="flex items-start gap-2 rounded-md border border-destructive/30 p-3 text-sm text-destructive">
              <TriangleAlert className="mt-0.5 h-4 w-4" aria-hidden="true" />
              Companies House lists this company as dissolved. Check the company number before continuing.
            </p>
          ) : null}

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium">Incorporated</dt>
              <dd className="text-muted-foreground">{prettyDate(preview.incorporatedOn)}</dd>
            </div>
            <div>
              <dt className="font-medium">Company type</dt>
              <dd className="text-muted-foreground">{preview.companyType ?? "Not shown"}</dd>
            </div>
            <div>
              <dt className="font-medium">Next accounts due</dt>
              <dd className="text-muted-foreground">{prettyDate(preview.accountsNextDue)}</dd>
            </div>
            <div>
              <dt className="font-medium">Next confirmation statement due</dt>
              <dd className="text-muted-foreground">{prettyDate(preview.confirmationNextDue)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium">Registered office</dt>
              <dd className="text-muted-foreground">{preview.registeredOffice ?? "Not shown"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium">SIC codes</dt>
              <dd className="text-muted-foreground">{preview.sicCodes.length ? preview.sicCodes.join(", ") : "Not shown"}</dd>
            </div>
          </dl>

          {!onConfirm && businessId ? (
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={useCompaniesHouseValues}
                onChange={(event) => setUseCompaniesHouseValues(event.target.checked)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              Use Companies House values where they differ from my saved profile.
            </label>
          ) : null}

          <Button type="button" className="w-full sm:w-auto" onClick={confirmPreview} disabled={isPending || isDissolved}>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {onConfirm ? "Use these details" : "Connect Companies House"}
          </Button>
        </div>
      ) : null}

      {businessId ? (
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={refresh} disabled={isPending}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh Companies House data
        </Button>
      ) : null}
    </div>
  );
}
