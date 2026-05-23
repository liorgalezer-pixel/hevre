import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  // Let the client-side page.tsx handle the session from the hash fragment
  return NextResponse.redirect(`${origin}/auth/callback`);
}
