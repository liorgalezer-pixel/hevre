import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {

    // ─── One-time boost payment completed ───────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.type !== "boost") break;

      const { jobId, tier, userId } = session.metadata;
      const boostedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // Update job boosted_until + boost_tier
      await supabaseAdmin
        .from("jobs")
        .update({ boosted_until: boostedUntil, boost_tier: tier, last_bumped_at: boostedUntil })
        .eq("id", jobId);

      // Record the boost
      await supabaseAdmin.from("job_boosts").insert({
        job_id: jobId,
        user_id: userId,
        stripe_payment_intent_id: session.payment_intent as string,
        tier,
        amount_cents: session.amount_total ?? 0,
        boosted_until: boostedUntil,
      });

      break;
    }

    // ─── Subscription created or renewed ────────────────────────────────
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      const plan = sub.metadata?.plan;
      if (!userId || !plan) break;

      const status = sub.cancel_at_period_end ? "canceling" : sub.status;
      await supabaseAdmin.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: sub.customer as string,
        stripe_subscription_id: sub.id,
        stripe_price_id: sub.items.data[0].price.id,
        plan,
        status,
        current_period_start: new Date(sub.items.data[0].current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.items.data[0].current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_subscription_id" });

      break;
    }

    // ─── Subscription canceled ───────────────────────────────────────────
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;

      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id);

      break;
    }
  }

  return NextResponse.json({ received: true });
}

