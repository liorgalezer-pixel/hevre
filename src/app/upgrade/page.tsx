"use client";

import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "plus",
    name: "מסלול משודרג פלוס",
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
    cta: "רכישה ל-7 ימים",
  },
  {
    id: "basic",
    name: "הקפצה אוטומטית בלבד",
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
    cta: "רכישה ל-7 ימים",
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [purchased, setPurchased] = useState(false);

  const handlePurchase = () => {
    if (!selected) return;
    setPurchased(true);
  };

  if (purchased) {
    return (
      <div className="flex flex-col min-h-screen bg-cream items-center justify-center px-6 gap-6" dir="rtl">
        <div className="w-24 h-24 rounded-full bg-warm-success-bg flex items-center justify-center">
          <CheckCircle2 size={52} className="text-warm-success" strokeWidth={1.5} />
        </div>
        <div className="text-center flex flex-col gap-2">
          <h2 className="font-serif text-2xl font-bold text-ink tracking-tight">המודעה שודרגה!</h2>
          <p className="text-sm text-ink-2 leading-relaxed">המודעה שלך תקבל חשיפה מוגברת בתוך דקות</p>
        </div>
        <button
          onClick={() => router.push("/my-jobs")}
          className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl active:opacity-90"
        >
          חזרה למשרות שלי
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <X size={20} className="text-ink-2" strokeWidth={2.2} />
        </button>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">שדרוג מודעה</h1>
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
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
              onClick={() => setSelected(plan.id)}
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
      </main>

      <div className="fixed bottom-0 right-0 left-0 bg-paper border-t border-divider px-4 py-4">
        <button
          onClick={handlePurchase}
          disabled={!selected}
          className={`w-full h-14 font-serif font-semibold text-lg rounded-2xl transition-all ${
            selected
              ? "bg-ink text-cream active:opacity-90"
              : "bg-cream-warm text-ink-3 cursor-not-allowed"
          }`}
        >
          {selected ? PLANS.find((p) => p.id === selected)?.cta : "בחר מסלול"}
        </button>
      </div>
    </div>
  );
}
