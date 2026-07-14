import { NextRequest, NextResponse } from "next/server";
import { runDeadlineReminders } from "@/lib/reminders";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";
  const result = await runDeadlineReminders({ dryRun });
  return NextResponse.json(result);
}
