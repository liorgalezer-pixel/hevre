import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID!;

async function dbGet(table: string, filter: string, select: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${filter}&select=${select}&limit=1`,
    {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    }
  );
  const data = await res.json();
  return Array.isArray(data) ? data[0] : null;
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const { job_id, applicant_id } = await req.json();
  if (!job_id || !applicant_id) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const job = await dbGet("jobs", `id=eq.${job_id}`, "title,employer_id");
  if (!job) return NextResponse.json({ error: "job not found" }, { status: 404 });

  const applicant = await dbGet("profiles", `id=eq.${applicant_id}`, "full_name");
  const employer = await dbGet("profiles", `id=eq.${job.employer_id}`, "fcm_token");

  if (!employer?.fcm_token) {
    return NextResponse.json({ skipped: "no token" });
  }

  const accessToken = await getFirebaseAccessToken();
  const applicantName = applicant?.full_name ?? "מישהו";

  const fcmRes = await fetch(
    `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: employer.fcm_token,
          notification: {
            title: "מועמדות חדשה! 🎉",
            body: `${applicantName} הגיש/ה מועמדות למשרת ${job.title}`,
          },
          data: { job_id: String(job_id), type: "new_application" },
        },
      }),
    }
  );

  if (!fcmRes.ok) {
    const err = await fcmRes.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}

async function getFirebaseAccessToken(): Promise<string> {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };
  const encode = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${encode(header)}.${encode(payload)}`;
  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  const signature = sign.sign(sa.private_key, "base64url");
  const jwt = `${unsigned}.${signature}`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}
