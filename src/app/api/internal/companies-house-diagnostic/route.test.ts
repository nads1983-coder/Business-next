import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { CompaniesHouseError } from "@/lib/companies-house/client";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  lookupCompanyProfile: vi.fn(),
  getPrisma: vi.fn()
}));

vi.mock("@/lib/companies-house/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/companies-house/client")>("@/lib/companies-house/client");
  return {
    ...actual,
    lookupCompanyProfile: mocks.lookupCompanyProfile
  };
});

vi.mock("@/lib/prisma", () => ({
  getPrisma: mocks.getPrisma
}));

const originalSecret = process.env.COMPANIES_HOUSE_DIAGNOSTIC_SECRET;

function request({
  secret = "diagnostic-secret",
  companyNumber = "15301265",
  forwardedFor = "203.0.113.10"
}: {
  secret?: string;
  companyNumber?: string;
  forwardedFor?: string;
} = {}) {
  return new NextRequest("https://example.com/api/internal/companies-house-diagnostic", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
      "x-forwarded-for": forwardedFor
    },
    body: JSON.stringify({ companyNumber })
  });
}

afterEach(() => {
  process.env.COMPANIES_HOUSE_DIAGNOSTIC_SECRET = originalSecret;
  mocks.lookupCompanyProfile.mockReset();
  mocks.getPrisma.mockReset();
  vi.resetModules();
});

describe("Companies House diagnostic route", () => {
  it("rejects missing and invalid diagnostic secrets", async () => {
    process.env.COMPANIES_HOUSE_DIAGNOSTIC_SECRET = "diagnostic-secret";
    const { POST } = await import("./route");

    expect((await POST(new NextRequest("https://example.com/api/internal/companies-house-diagnostic", { method: "POST" }))).status).toBe(401);
    expect((await POST(request({ secret: "wrong-secret" }))).status).toBe(401);
    expect(mocks.lookupCompanyProfile).not.toHaveBeenCalled();
  });

  it("returns a minimal safe response for a valid lookup", async () => {
    process.env.COMPANIES_HOUSE_DIAGNOSTIC_SECRET = "diagnostic-secret";
    mocks.lookupCompanyProfile.mockResolvedValue({
      company_name: "NADINE’S BRAND BUILDERS LTD",
      company_number: "15301265",
      company_status: "dissolved",
      type: "ltd",
      date_of_creation: "2023-11-21",
      accounts: { next_due: "2026-02-28", overdue: false },
      confirmation_statement: { next_due: "2026-03-17", overdue: false },
      registered_office_address: { address_line_1: "Do not return this" },
      sic_codes: ["70229"]
    });
    const { POST } = await import("./route");

    const response = await POST(request());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      companyName: "NADINE’S BRAND BUILDERS LTD",
      companyNumber: "15301265",
      companyStatus: "dissolved",
      companyType: "ltd",
      incorporatedOn: "2023-11-21",
      accountsNextDue: "2026-02-28",
      confirmationStatementNextDue: "2026-03-17"
    });
    expect(JSON.stringify(body)).not.toContain("Do not return this");
    expect(JSON.stringify(body)).not.toContain("diagnostic-secret");
    expect(mocks.getPrisma).not.toHaveBeenCalled();
  });

  it("rejects invalid company numbers before lookup", async () => {
    process.env.COMPANIES_HOUSE_DIAGNOSTIC_SECRET = "diagnostic-secret";
    const { POST } = await import("./route");

    const response = await POST(request({ companyNumber: "not a company number" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Enter a valid company number." });
    expect(mocks.lookupCompanyProfile).not.toHaveBeenCalled();
  });

  it("maps not found and upstream failures to safe responses", async () => {
    process.env.COMPANIES_HOUSE_DIAGNOSTIC_SECRET = "diagnostic-secret";
    const { POST } = await import("./route");

    mocks.lookupCompanyProfile.mockRejectedValueOnce(new CompaniesHouseError("not_found", "raw upstream not found", 404));
    expect((await POST(request({ forwardedFor: "203.0.113.11" }))).status).toBe(404);

    mocks.lookupCompanyProfile.mockRejectedValueOnce(new CompaniesHouseError("unavailable", "raw upstream failed", 503));
    const response = await POST(request({ forwardedFor: "203.0.113.12" }));
    const body = await response.json();
    expect(response.status).toBe(502);
    expect(body).toEqual({ error: "Companies House lookup failed." });
    expect(JSON.stringify(body)).not.toContain("raw upstream");
  });

  it("rate limits repeated diagnostic requests", async () => {
    process.env.COMPANIES_HOUSE_DIAGNOSTIC_SECRET = "diagnostic-secret";
    mocks.lookupCompanyProfile.mockResolvedValue({
      company_name: "TEST LTD",
      company_number: "15301265"
    });
    const { POST } = await import("./route");

    for (let index = 0; index < 6; index += 1) {
      expect((await POST(request({ forwardedFor: "203.0.113.13" }))).status).toBe(200);
    }

    expect((await POST(request({ forwardedFor: "203.0.113.13" }))).status).toBe(429);
  });
});
