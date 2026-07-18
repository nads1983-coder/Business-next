import { format } from "date-fns";
import { Archive, CheckCircle2, FileText, RotateCcw, Save, ShieldCheck } from "lucide-react";
import type React from "react";
import {
  archiveDocumentAction,
  createDocumentAction,
  markDocumentRenewedAction,
  restoreDocumentAction,
  updateDocumentAction
} from "@/app/app/documents/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deriveDocumentStatus,
  documentTypeLabel,
  documentTypeOptions,
  renewalFrequencyLabel,
  renewalFrequencyOptions
} from "@/lib/document-renewals";
import { getPrisma } from "@/lib/prisma";
import { requireProductAccess } from "@/lib/billing";

const statusCopy: Record<string, string> = {
  ACTIVE: "Active",
  EXPIRING_SOON: "Expiring soon",
  EXPIRED: "Expired",
  RENEWED: "Renewed",
  NO_LONGER_REQUIRED: "No longer required",
  ARCHIVED: "Archived"
};

const statusTone: Record<string, "default" | "secondary" | "outline" | "calm"> = {
  ACTIVE: "calm",
  EXPIRING_SOON: "secondary",
  EXPIRED: "default",
  RENEWED: "calm",
  NO_LONGER_REQUIRED: "outline",
  ARCHIVED: "outline"
};

const reminderOptions = [
  ["standard", "Standard"],
  ["reduced", "Reduced"],
  ["critical", "Critical only"],
  ["off", "Off"]
] as const;

function dateValue(date: Date | null | undefined) {
  return date ? format(date, "yyyy-MM-dd") : "";
}

function displayDate(date: Date | null | undefined) {
  return date ? format(date, "d MMM yyyy") : "Not set";
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SelectField({
  name,
  defaultValue,
  options
}: {
  name: string;
  defaultValue?: string | null;
  options: readonly (readonly [string, string])[] | string[][];
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
    >
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

function MetadataFields({
  document
}: {
  document?: {
    kind: string;
    name: string;
    provider: string | null;
    referenceNumber: string | null;
    issueDate: Date | null;
    startDate: Date | null;
    renewalDate: Date | null;
    renewalFrequency: string | null;
    status: string;
    notes: string | null;
    reminderPreference: string;
  };
}) {
  const editableStatus = document?.status === "NO_LONGER_REQUIRED" ? "NO_LONGER_REQUIRED" : "ACTIVE";

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Document type">
          <SelectField name="kind" defaultValue={document?.kind ?? "BUSINESS_INSURANCE"} options={documentTypeOptions} />
        </Field>
        <Field label="Title">
          <Input name="name" defaultValue={document?.name} placeholder="Public liability policy" required />
        </Field>
        <Field label="Provider or issuer">
          <Input name="provider" defaultValue={document?.provider ?? ""} placeholder="Insurer, authority or supplier" />
        </Field>
        <Field label="Reference number">
          <Input name="referenceNumber" defaultValue={document?.referenceNumber ?? ""} placeholder="Policy, licence or contract ref" />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Field label="Issue date">
          <Input name="issueDate" type="date" defaultValue={dateValue(document?.issueDate)} />
        </Field>
        <Field label="Start date">
          <Input name="startDate" type="date" defaultValue={dateValue(document?.startDate)} />
        </Field>
        <Field label="Expiry or renewal date">
          <Input name="renewalDate" type="date" defaultValue={dateValue(document?.renewalDate)} />
        </Field>
        <Field label="Frequency">
          <SelectField name="renewalFrequency" defaultValue={document?.renewalFrequency ?? "NONE"} options={renewalFrequencyOptions} />
        </Field>
        <Field label="Reminders">
          <SelectField name="reminderPreference" defaultValue={document?.reminderPreference ?? "standard"} options={reminderOptions} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <Field label="Tracking status">
          <SelectField
            name="status"
            defaultValue={editableStatus}
            options={[
              ["ACTIVE", "Track as active"],
              ["NO_LONGER_REQUIRED", "No longer required"]
            ]}
          />
        </Field>
        <Field label="Notes">
          <Textarea name="notes" defaultValue={document?.notes ?? ""} placeholder="Internal notes only. Do not add passwords or secret keys." />
        </Field>
      </div>
    </>
  );
}

export default async function DocumentsPage() {
  const { user } = await requireProductAccess();
  const prisma = getPrisma();
  const business = await prisma.business.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      documents: {
        orderBy: [{ archivedAt: "asc" }, { renewalDate: "asc" }, { createdAt: "desc" }],
        include: {
          renewalHistory: {
            orderBy: { createdAt: "desc" },
            take: 6
          }
        }
      }
    }
  });
  const documents = business?.documents ?? [];
  const activeCount = documents.filter((document) => deriveDocumentStatus(document) === "ACTIVE").length;
  const attentionCount = documents.filter((document) => ["EXPIRING_SOON", "EXPIRED"].includes(deriveDocumentStatus(document))).length;
  const archivedCount = documents.filter((document) => deriveDocumentStatus(document) === "ARCHIVED").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Documents</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Track renewal dates for policies, licences, contracts and operating records. Items here are reminders and records; not every document type is a legal requirement.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md border px-3 py-2">
            <p className="text-lg font-semibold">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="rounded-md border px-3 py-2">
            <p className="text-lg font-semibold">{attentionCount}</p>
            <p className="text-xs text-muted-foreground">Attention</p>
          </div>
          <div className="rounded-md border px-3 py-2">
            <p className="text-lg font-semibold">{archivedCount}</p>
            <p className="text-xs text-muted-foreground">Archived</p>
          </div>
        </div>
      </div>

      {!business ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="font-medium">Add business details before tracking documents.</p>
              <p className="mt-1 text-sm text-muted-foreground">Document renewals are tied to your business record so ownership checks stay server-side.</p>
            </div>
            <Button asChild>
              <a href="/app/settings">Add business details</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <CardTitle>Add renewal document</CardTitle>
                <CardDescription>Save metadata and reminder preferences without exposing attachment URLs.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={createDocumentAction} className="space-y-4">
              <MetadataFields />
              <Button type="submit">
                <Save className="h-4 w-4" aria-hidden="true" />
                Save document
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-semibold tracking-normal">Renewal tracker</h2>
            <p className="text-sm text-muted-foreground">Edit dates, mark renewals complete and keep the previous trail visible.</p>
          </div>
        </div>

        {documents.length ? (
          <div className="grid gap-4">
            {documents.map((document) => {
              const status = deriveDocumentStatus(document);

              return (
                <Card key={document.id}>
                  <CardHeader>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <CardTitle>{document.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {documentTypeLabel(document.kind)} - {renewalFrequencyLabel(document.renewalFrequency)} - Renewal {displayDate(document.renewalDate)}
                        </CardDescription>
                      </div>
                      <Badge variant={statusTone[status] ?? "outline"}>{statusCopy[status] ?? status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="font-medium">Provider or issuer</p>
                        <p className="mt-1 text-muted-foreground">{document.provider || "Not set"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Reference</p>
                        <p className="mt-1 text-muted-foreground">{document.referenceNumber || "Not set"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Coverage period</p>
                        <p className="mt-1 text-muted-foreground">
                          {displayDate(document.startDate)} to {displayDate(document.renewalDate)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Attachment</p>
                        <p className="mt-1 text-muted-foreground">{document.storageKey ? "Saved privately" : "No attachment saved"}</p>
                      </div>
                    </div>

                    <form action={updateDocumentAction} className="space-y-4 rounded-md border p-4">
                      <input type="hidden" name="documentId" value={document.id} />
                      <MetadataFields document={document} />
                      <Button type="submit" variant="outline">
                        <Save className="h-4 w-4" aria-hidden="true" />
                        Save changes
                      </Button>
                    </form>

                    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                      <form action={markDocumentRenewedAction} className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                        <input type="hidden" name="documentId" value={document.id} />
                        <Field label="Renewed on">
                          <Input name="renewedOn" type="date" defaultValue={dateValue(new Date())} />
                        </Field>
                        <Field label="Next renewal date">
                          <Input name="newRenewalDate" type="date" />
                        </Field>
                        <Field label="Renewal note">
                          <Input name="note" placeholder="Optional" />
                        </Field>
                        <Button type="submit">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          Renewed
                        </Button>
                      </form>

                      {status === "ARCHIVED" ? (
                        <form action={restoreDocumentAction} className="flex items-end rounded-md border p-4">
                          <input type="hidden" name="documentId" value={document.id} />
                          <Button type="submit" variant="outline" className="w-full">
                            <RotateCcw className="h-4 w-4" aria-hidden="true" />
                            Restore
                          </Button>
                        </form>
                      ) : (
                        <form action={archiveDocumentAction} className="flex items-end rounded-md border p-4">
                          <input type="hidden" name="documentId" value={document.id} />
                          <Button type="submit" variant="outline" className="w-full">
                            <Archive className="h-4 w-4" aria-hidden="true" />
                            Archive
                          </Button>
                        </form>
                      )}
                    </div>

                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium">Renewal history</h3>
                      {document.renewalHistory.length ? (
                        <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                          {document.renewalHistory.map((item) => (
                            <li key={item.id}>
                              <span className="font-medium text-foreground">{item.action.replaceAll("_", " ")}</span> on {format(item.createdAt, "d MMM yyyy")}
                              {item.previousRenewalDate || item.newRenewalDate ? (
                                <span>
                                  {" "}
                                  - {displayDate(item.previousRenewalDate)} to {displayDate(item.newRenewalDate)}
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">No history recorded yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Saved document renewals will appear here after you add the first record.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
