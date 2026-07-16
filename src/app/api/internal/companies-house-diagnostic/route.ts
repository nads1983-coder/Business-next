import { NextRequest, NextResponse } from "next/server";
import {
  CompaniesHouseError,
  lookupCompanyProfile,
  validateCompanyNumber
} from "@/lib/companies-house/client";

const windowMs = 60_000;
const maxRequestsPerWindow = 6;
const attempts = new Map<string, { count: number; resetAt: number }>();

function throttleKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isThrottled(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (current.count >= maxRequestsPerWindow) return true;
  current.count += 1;
  return false;
}

function safeError(error: unknown) {
  if (error instanceof CompaniesHouseError) {
    if (error.code === "not_found") {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }
    if (error.code === "invalid_company_number") {
      return NextResponse.json({ error: "Enter a valid company number." }, { status: 400 });
    }
    if (error.code === "rate_limited") {
      return NextResponse.json({ error: "Companies House is busy. Try again shortly." }, { status: 502 });
    }
  }
  return NextResponse.json({ error: "Companies House lookup failed." }, { status: 502 });
}

export async function POST(request: NextRequest) {
  const secret = process.env.COMPANIES_HOUSE_DIAGNOSTIC_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (isThrottled(throttleKey(request))) {
    return NextResponse.json({ error: "Too many diagnostic requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body with a company number." }, { status: 400 });
  }

  const companyNumber = typeof body === "object" && body && "companyNumber" in body
    ? String(body.companyNumber)
    : "";
  const normalised = validateCompanyNumber(companyNumber);
  if (!normalised) {
    return NextResponse.json({ error: "Enter a valid company number." }, { status: 400 });
  }

  try {
    const company = await lookupCompanyProfile(normalised);
    return NextResponse.json({
      companyName: company.company_name,
      companyNumber: company.company_number,
      companyStatus: company.company_status ?? null,
      companyType: company.type ?? null,
      incorporatedOn: company.date_of_creation ?? null,
      accountsNextDue: company.accounts?.next_due ?? null,
      confirmationStatementNextDue: company.confirmation_statement?.next_due ?? null
    });
  } catch (error) {
    return safeError(error);
  }
}
