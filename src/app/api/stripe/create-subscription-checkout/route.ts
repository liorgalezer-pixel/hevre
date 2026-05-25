import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICES, SubscriptionPlan } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { plan, userId } = await req.json() as {
    plan: SubscriptionPlan;
    userId: string;
  };

  if (!plan || !userId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const priceId = plan === "plus"
    ? STRIPE_PRICES.hevre_plus
    : STRIPE_PRICES.hevre_pro;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id, email, first_name, last_name")
    .eq("id", userId)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email,
      name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(),
      metadata: { userId },
    });
    customerId = customer.id;
    await supabaseAdmin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", userId);
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId, plan, type: "subscription" },
    success_url: `${origin}/hevre-plus/success?plan=${plan}`,
    cancel_url: `${origin}/hevre-plus`,
    subscription_data: {
      metadata: { userId, plan },
    },
  });

  return NextResponse.json({ url: session.url });
}
