import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({ received: body });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
