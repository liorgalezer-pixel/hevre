import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return _stripe;
}

// Price IDs — set these after creating products in Stripe dashboard
export const STRIPE_PRICES = {
  // Job boost — one-time payments
  boost_bump: process.env.STRIPE_PRICE_BOOST_BUMP!,       // $17 - הקפצה אוטומטית
  boost_featured: process.env.STRIPE_PRICE_BOOST_FEATURED!, // $25 - מסלול משודרג פלוס

  // HEVRE+ — recurring subscriptions
  hevre_pro: process.env.STRIPE_PRICE_HEVRE_PRO!,         // $15/month
  hevre_plus: process.env.STRIPE_PRICE_HEVRE_PLUS!,       // $29.99/month
} as const;

export type BoostTier = "bump" | "featured";
export type SubscriptionPlan = "pro" | "plus";
