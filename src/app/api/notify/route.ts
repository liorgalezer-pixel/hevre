import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { job_id, applicant_id } = body;

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: "missing env vars" }, { status: 500 });
  }

  const jobRes = await fetch(
    `${SUPABASE_URL}/rest/v1/jobs?id=eq.${job_id}&select=title,employer_id&limit=1`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
  );

  const jobs = await jobRes.json();

  return NextResponse.json({ received: { job_id, applicant_id }, job: jobs[0] ?? null });
}
