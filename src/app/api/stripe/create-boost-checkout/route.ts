import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICES, BoostTier } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { jobId, tier, userId } = await req.json() as {
    jobId: string;
    tier: BoostTier;
    userId: string;
  };

  if (!jobId || !tier || !userId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const priceId = tier === "featured"
    ? STRIPE_PRICES.boost_featured
    : STRIPE_PRICES.boost_bump;

  // Fetch or create Stripe customer for this user
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
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { jobId, tier, userId, type: "boost" },
    success_url: `${origin}/upgrade/success?job=${jobId}&tier=${tier}`,
    cancel_url: `${origin}/upgrade/${jobId}`,
  });

  return NextResponse.json({ url: session.url });
}
