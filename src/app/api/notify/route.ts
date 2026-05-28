import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  return NextResponse.json({ ok: true });
}

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getFirebaseAccessToken(): Promise<string> {
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON!;
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: sa.client_email,
      sub: sa.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
    })
  );

  const signingInput = `${header}.${payload}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = base64url(sign.sign(sa.private_key));
  const jwt = `${signingInput}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("no access_token: " + JSON.stringify(data));
  return data.access_token;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { job_id, applicant_id } = body;

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

  if (!SUPABASE_URL || !SERVICE_KEY || !PROJECT_ID || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return NextResponse.json({ error: "missing env vars" }, { status: 500 });
  }

  const headers = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };

  const [jobRes, applicantRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/jobs?id=eq.${job_id}&select=title,employer_id&limit=1`, { headers }),
    fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${applicant_id}&select=full_name&limit=1`, { headers }),
  ]);

  const jobs = await jobRes.json();
  const applicants = await applicantRes.json();

  const job = jobs[0];
  if (!job) return NextResponse.json({ error: "job not found" }, { status: 404 });

  const applicantName = applicants[0]?.full_name ?? "מועמד חדש";

  const employerRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${job.employer_id}&select=fcm_token&limit=1`,
    { headers }
  );
  const employers = await employerRes.json();
  const fcmToken = employers[0]?.fcm_token;

  if (!fcmToken) {
    return NextResponse.json({ ok: true, skipped: "no fcm token" });
  }

  const accessToken = await getFirebaseAccessToken();

  const fcmRes = await fetch(
    `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: {
            title: `הגשה חדשה ל${job.title}`,
            body: `${applicantName} הגיש/ה מועמדות`,
          },
          data: { job_id: String(job_id) },
          android: { priority: "high" },
        },
      }),
    }
  );

  const fcmData = await fcmRes.json();
  return NextResponse.json({ ok: true, fcm: fcmData });
}
