import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSign } from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const { job_id, applicant_id } = await req.json();

  if (!job_id || !applicant_id) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const { data: job } = await supabaseAdmin
    .from("jobs")
    .select("title, employer_id")
    .eq("id", job_id)
    .single();

  if (!job) return NextResponse.json({ error: "job not found" }, { status: 404 });

  const { data: applicant } = await supabaseAdmin
    .from("profiles")
    .select("full_name")
    .eq("id", applicant_id)
    .single();

  const { data: employer } = await supabaseAdmin
    .from("profiles")
    .select("fcm_token")
    .eq("id", job.employer_id)
    .single();

  if (!employer?.fcm_token) {
    return NextResponse.json({ skipped: "no token" });
  }

  const applicantName = applicant?.full_name ?? "מישהו";
  const accessToken = await getFirebaseAccessToken();
  const projectId = process.env.FIREBASE_PROJECT_ID!;

  const fcmRes = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
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
          data: {
            job_id: String(job_id),
            type: "new_application",
          },
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
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const unsigned = `${encode(header)}.${encode(payload)}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  const signature = sign.sign(serviceAccount.private_key, "base64url");
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
