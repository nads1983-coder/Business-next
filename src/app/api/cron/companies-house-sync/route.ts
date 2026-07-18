import { NextRequest, NextResponse } from "next/server";
import { companiesHouseSyncConfig, runCompaniesHouseSync } from "@/lib/companies-house/sync";

async function handleCompaniesHouseSync(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "25", 10);
  const config = companiesHouseSyncConfig();
  const result = await runCompaniesHouseSync({
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), config.maxBatchSize) : config.batchSize
  });
  return NextResponse.json(result);
}

export async function GET(request: NextRequest) {
  return handleCompaniesHouseSync(request);
}

export async function POST(request: NextRequest) {
  return handleCompaniesHouseSync(request);
}
