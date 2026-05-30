import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { userId } = await req.json() as { userId: string };
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (!sub?.stripe_subscription_id)
    return NextResponse.json({ error: "No active subscription" }, { status: 404 });

  // Cancel at period end (user keeps access until end of billing cycle)
  await getStripe().subscriptions.update(sub.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "canceling", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", sub.stripe_subscription_id);

  return NextResponse.json({ success: true });
}
