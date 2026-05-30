"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PLANS = [
  {
    id: "pro",
    name: "Hevre Pro",
    price: "$15",
    period: "לחודש",
    badge: null,
    featured: false,
    features: [
      "עד 5 משרות פעילות בו-זמנית",
      "חשיפה מוגברת בפיד",
      "תמיכה מועדפת",
    ],
    notIncluded: [
      "וי כחול ואימות עסק",
      "פרסום משרות ללא הגבלה",
    ],
    cta: "שדרג ל-Pro — $15/חודש",
  },
  {
    id: "plus",
    name: "Hevre+",
    price: "$29.99",
    period: "לחודש",
    badge: "הכי שלם",
    featured: true,
    features: [
      "פרסום משרות ללא הגבלה",
      "וי כחול ואימות עסק בפרסום",
      "חשיפה מקסימלית בפיד",
      "תמיכה VIP",
    ],
    notIncluded: [],
    cta: "שדרג ל-Hevre+ — $29.99/חודש",
  },
];

export default function HevrePlusPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePurchase = async () => {
    if (!selected) return;
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const res = await fetch("/api/stripe/create-subscription-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selected, userId: user.id }),
    });

    const data = await res.json();
    if (!res.ok || !data.url) {
      setError("שגיאה ביצירת תשלום — נסה שוב");
      setLoading(false);
      return;
    }

    if (typeof (window as any).Capacitor !== "undefined") {
      const { Browser } = await import("@capacitor/browser");
      const { App } = await import("@capacitor/app");

      // When app returns to foreground after payment, check Supabase for active subscription
      const stateListener = await App.addListener("appStateChange", async ({ isActive }) => {
        if (!isActive) return;
        await stateListener.remove();
        setLoading(false);
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!u) return;
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", u.id)
          .eq("status", "active")
          .maybeSingle();
        if (sub) router.replace("/subscription");
      });

      Browser.addListener("browserFinished", () => {
        setLoading(false);
      });

      await Browser.open({ url: data.url });
    } else {
      window.location.href = data.url;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">שדרג את החשבון</h1>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <X size={20} className="text-ink-2" strokeWidth={2.2} />
        </button>
      </header>

      <main className="flex-1 px-4 pt-6 pb-32 flex flex-col gap-4">
        <div className="text-center flex flex-col gap-1 mb-2">
          <h2 className="font-serif text-2xl font-bold text-ink tracking-tight">בחר את המסלול שלך ✦</h2>
          <p className="text-sm text-ink-3">פרסם יותר, הגע ליותר מועמדים</p>
        </div>

        {PLANS.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`w-full rounded-3xl overflow-hidden transition-all text-right ring-2 ${
                isSelected ? "ring-terracotta shadow-lg" : "ring-divider"
              }`}
            >
              <div className={`px-5 pt-4 pb-5 ${plan.featured ? "bg-terracotta" : "bg-ink"}`}>
                <div className="flex items-center justify-between mb-3">
                  {plan.badge ? (
                    <span className="bg-white/20 text-cream text-xs font-semibold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  ) : <div />}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-cream bg-cream" : "border-cream/40"
                  }`}>
                    {isSelected && <div className={`w-3 h-3 rounded-full ${plan.featured ? "bg-terracotta" : "bg-ink"}`} />}
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-cream mb-1 tracking-tight">{plan.name}</h3>
                <div className="flex items-end gap-1">
                  <span className="font-serif text-4xl font-bold text-cream leading-none">{plan.price}</span>
                  <span className="text-cream/60 text-sm mb-1">{plan.period}</span>
                </div>
              </div>

              <div className="bg-paper px-5 py-4 flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5" style={{ direction: "rtl" }}>
                    <span className="text-warm-success font-bold text-base shrink-0">✓</span>
                    <span className="text-sm text-ink-2">{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map((f) => (
                  <div key={f} className="flex items-center gap-2.5" style={{ direction: "rtl" }}>
                    <span className="text-ink-3 font-bold text-base shrink-0">✗</span>
                    <span className="text-sm text-ink-3">{f}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}

        <p className="text-xs text-ink-3 text-center mt-1">ניתן לבטל בכל עת • ללא התחייבות</p>
        {error && <p className="text-warm-danger text-sm text-center">{error}</p>}
      </main>

      <div className="fixed bottom-0 right-0 left-0 bg-paper border-t border-divider px-4 py-4">
        <button
          onClick={handlePurchase}
          disabled={!selected || loading}
          className={`w-full h-14 font-serif font-semibold text-lg rounded-2xl transition-all ${
            selected && !loading
              ? "bg-terracotta text-cream active:opacity-90"
              : "bg-cream-warm text-ink-3 cursor-not-allowed"
          }`}
        >
          {loading ? "מעבד..." : selected ? PLANS.find((p) => p.id === selected)?.cta : "בחר מסלול"}
        </button>
      </div>
    </div>
  );
}
