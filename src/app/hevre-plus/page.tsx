"use client";

import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import Image from "next/image";

const PLANS = [
  {
    id: "pro",
    name: "Hevre Pro",
    price: "$15",
    period: "לחודש",
    color: "from-blue-500 to-blue-700",
    badge: null,
    features: [
      "עד 5 משרות פעילות בו-זמנית",
      "חשיפה מוגברת בפיד",
      "תמיכה מועדפת",
    ],
    notIncluded: [
      "וי כחול ואימות עסק",
      "פרסום משרות ללא הגבלה",
    ],
    cta: "שדרג ל-Pro",
  },
  {
    id: "plus",
    name: "Hevre+",
    price: "$29.99",
    period: "לחודש",
    color: "from-indigo-600 to-violet-600",
    badge: "הכי שלם",
    features: [
      "פרסום משרות ללא הגבלה",
      "וי כחול ואימות עסק בפרסום",
      "חשיפה מקסימלית בפיד",
      "תמיכה VIP 24/7",
      "כל יתרונות Pro כלולים",
    ],
    notIncluded: [],
    cta: "שדרג ל-Hevre+",
  },
];

export default function HevrePlusPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [purchased, setPurchased] = useState(false);

  const handlePurchase = () => {
    if (!selected) return;
    posthog.capture("premium_click", { feature_type: selected });
    setPurchased(true);
  };

  if (purchased) {
    const plan = PLANS.find((p) => p.id === selected)!;
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center px-6 gap-6" dir="rtl">
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
          <CheckCircle2 size={52} className="text-blue-700" strokeWidth={1.5} />
        </div>
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl font-black text-gray-900">ברוך הבא ל-{plan.name}! 🎉</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            {plan.id === "plus"
              ? "יש לך עכשיו פרסום ללא הגבלה + וי כחול בכל המשרות שלך"
              : "יש לך עכשיו גישה לפרסום עד 5 משרות בו-זמנית"}
          </p>
        </div>
        <button
          onClick={() => router.push("/my-jobs")}
          className="w-full h-14 bg-blue-700 text-white font-black text-base rounded-2xl active:bg-blue-800"
        >
          חזרה למשרות שלי
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center rounded-full active:bg-gray-100">
          <X size={20} className="text-gray-600" strokeWidth={2.2} />
        </button>
        <h1 className="text-base font-bold text-gray-900">שדרג את החשבון</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={72} height={28} className="object-contain" />
      </header>

      <main className="flex-1 px-4 pt-6 pb-32 flex flex-col gap-5">

        <div className="text-center flex flex-col gap-1 mb-2">
          <h2 className="text-2xl font-black text-gray-900">בחר את המסלול שלך ✦</h2>
          <p className="text-sm text-gray-400">פרסם יותר, הגע ליותר מועמדים</p>
        </div>

        {PLANS.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`w-full rounded-3xl overflow-hidden shadow-sm border-2 transition-all text-right ${
                isSelected ? "border-blue-600 shadow-blue-100 shadow-lg" : "border-transparent"
              }`}
            >
              <div className={`bg-gradient-to-l ${plan.color} px-5 pt-4 pb-5`}>
                <div className="flex items-center justify-between mb-3">
                  {plan.badge ? (
                    <span className="bg-white/25 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  ) : <div />}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-white bg-white" : "border-white/50"}`}>
                    {isSelected && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                  </div>
                </div>
                <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-white leading-none">{plan.price}</span>
                  <span className="text-white/70 text-sm mb-1">{plan.period}</span>
                </div>
              </div>

              <div className="bg-white px-5 py-4 flex flex-col gap-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 justify-end">
                    <span className="text-sm text-gray-700">{f}</span>
                    <span className="text-green-500 font-black text-base shrink-0">✓</span>
                  </div>
                ))}
                {plan.notIncluded.map((f) => (
                  <div key={f} className="flex items-center gap-2 justify-end">
                    <span className="text-sm text-gray-300">{f}</span>
                    <span className="text-gray-300 font-black text-base shrink-0">✗</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}

        <p className="text-xs text-gray-400 text-center mt-1">ניתן לבטל בכל עת • ללא התחייבות</p>
      </main>

      <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handlePurchase}
          disabled={!selected}
          className={`w-full h-14 font-black text-lg rounded-2xl transition-all ${
            selected
              ? `bg-gradient-to-l ${PLANS.find((p) => p.id === selected)?.color} text-white active:opacity-90 shadow-md`
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {selected ? PLANS.find((p) => p.id === selected)?.cta : "בחר מסלול"}
        </button>
      </div>
    </div>
  );
}
