import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({ ok: true });
}

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getFirebaseAccessToken(saJson: string): Promise<string> {
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);

  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = b64url(
    new TextEncoder().encode(
      JSON.stringify({
        iss: sa.client_email,
        sub: sa.client_email,
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
      })
    )
  );

  const signingInput = `${header}.${payload}`;

  const pemBody = sa.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");

  const binaryDer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput)
  );

  const jwt = `${signingInput}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json() as { access_token?: string };
  if (!data.access_token) throw new Error("no access_token");
  return data.access_token;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { job_id?: string; applicant_id?: string };
  const { job_id, applicant_id } = body;

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  const SA_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!SUPABASE_URL || !SERVICE_KEY || !PROJECT_ID || !SA_JSON) {
    return NextResponse.json({ error: "missing env vars" }, { status: 500 });
  }

  const h = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };

  const [jobRes, applicantRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/jobs?id=eq.${job_id}&select=title,employer_id&limit=1`, { headers: h }),
    fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${applicant_id}&select=full_name&limit=1`, { headers: h }),
  ]);

  const jobs = await jobRes.json() as Array<{ title: string; employer_id: string }>;
  const applicants = await applicantRes.json() as Array<{ full_name?: string }>;

  const job = jobs[0];
  if (!job) return NextResponse.json({ error: "job not found" }, { status: 404 });

  const applicantName = applicants[0]?.full_name ?? "מועמד חדש";

  const employerRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${job.employer_id}&select=fcm_token&limit=1`,
    { headers: h }
  );
  const employers = await employerRes.json() as Array<{ fcm_token?: string }>;
  const fcmToken = employers[0]?.fcm_token;

  if (!fcmToken) {
    return NextResponse.json({ ok: true, skipped: "no fcm token" });
  }

  const accessToken = await getFirebaseAccessToken(SA_JSON);

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
