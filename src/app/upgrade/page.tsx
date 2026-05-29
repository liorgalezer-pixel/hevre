"use client";

import { useState, useEffect, Suspense } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import posthog from "posthog-js";

const PLANS = [
  {
    id: "featured",
    name: 'מסלול "גיוס מהיר"',
    price: "$25",
    period: "ל-7 ימים",
    badge: "הכי פופולרי",
    featured: true,
    features: [
      "הקפצה אוטומטית כל 4 שעות",
      "מיקום גבוה יותר מעל כולם",
      "שדרוג לנראות מקסימלית",
    ],
    notIncluded: [],
    cta: "רכישה ל-7 ימים — $25",
  },
  {
    id: "bump",
    name: 'מסלול "בוסט"',
    price: "$17",
    period: "ל-7 ימים",
    badge: null,
    featured: false,
    features: [
      "הקפצה אוטומטית כל 4 שעות",
    ],
    notIncluded: [
      "מיקום גבוה יותר מעל כולם",
      "שדרוג לנראות מקסימלית",
    ],
    cta: "רכישה ל-7 ימים — $17",
  },
];

function UpgradeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const jobId = params.get("job");

  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) router.replace("/my-jobs");
    else posthog.capture("upgrade_page_viewed", { job_id: jobId });
  }, [jobId, router]);

  useEffect(() => {
    const onFocus = () => setLoading(false);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const handlePurchase = async () => {
    if (!selected || !jobId) return;
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    posthog.capture("upgrade_checkout_started", { job_id: jobId, plan: selected });

    const res = await fetch("/api/stripe/create-boost-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, tier: selected, userId: user.id }),
    });

    const data = await res.json();
    if (!res.ok || !data.url) {
      setError("שגיאה ביצירת תשלום — נסה שוב");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">שדרוג מודעה</h1>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <X size={20} className="text-ink-2" strokeWidth={2.2} />
        </button>
      </header>

      <main className="flex-1 px-4 pt-6 pb-32 flex flex-col gap-5">
        <div className="text-center flex flex-col gap-1 mb-2">
          <h2 className="font-serif text-2xl font-bold text-ink tracking-tight">שדרג את המודעה</h2>
          <p className="text-sm text-ink-3">הגע ליותר מועמדים במחיר מוזל</p>
        </div>

        {PLANS.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => { setSelected(plan.id); posthog.capture("upgrade_plan_selected", { job_id: jobId, plan: plan.id }); }}
              className={`w-full rounded-3xl overflow-hidden transition-all text-right ring-2 ${
                isSelected ? "ring-terracotta shadow-lg" : "ring-divider"
              }`}
            >
              <div className={`px-5 pt-4 pb-5 ${plan.featured ? "bg-ink" : "bg-ink-2"}`}>
                <div className="flex items-center justify-between mb-3">
                  {plan.badge ? (
                    <span className="bg-terracotta text-cream text-xs font-bold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  ) : <div />}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-cream bg-cream" : "border-cream/40"}`}>
                    {isSelected && <div className="w-3 h-3 rounded-full bg-terracotta" />}
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-cream mb-1 tracking-tight">{plan.name}</h3>
                <div className="flex items-end gap-1">
                  <span className="font-serif text-4xl font-bold text-cream leading-none">{plan.price}</span>
                  <span className="text-cream/60 text-sm mb-1">{plan.period}</span>
                </div>
              </div>

              <div className="bg-paper px-5 py-4 flex flex-col gap-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 justify-end">
                    <span className="text-sm text-ink-2">{f}</span>
                    <span className="text-warm-success font-bold text-base shrink-0">✓</span>
                  </div>
                ))}
                {plan.notIncluded.map((f) => (
                  <div key={f} className="flex items-center gap-2 justify-end">
                    <span className="text-sm text-ink-3">{f}</span>
                    <span className="text-ink-3 font-bold text-base shrink-0">✗</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}

        <p className="text-xs text-ink-3 text-center mt-1">תשלום חד-פעמי • ללא התחייבות</p>
        {error && <p className="text-warm-danger text-sm text-center">{error}</p>}
      </main>

      <div className="fixed bottom-0 right-0 left-0 bg-paper border-t border-divider px-4 py-4">
        <button
          onClick={handlePurchase}
          disabled={!selected || loading}
          className={`w-full h-14 font-serif font-semibold text-lg rounded-2xl transition-all ${
            selected && !loading
              ? "bg-ink text-cream active:opacity-90"
              : "bg-cream-warm text-ink-3 cursor-not-allowed"
          }`}
        >
          {loading ? "מעבד..." : selected ? PLANS.find((p) => p.id === selected)?.cta : "בחר מסלול"}
        </button>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense>
      <UpgradeContent />
    </Suspense>
  );
}
