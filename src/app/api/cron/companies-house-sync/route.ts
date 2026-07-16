import { NextRequest, NextResponse } from "next/server";
import { runCompaniesHouseSync } from "@/lib/companies-house/sync";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "25", 10);
  const result = await runCompaniesHouseSync({
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 25
  });
  return NextResponse.json(result);
}
