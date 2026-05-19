"use client";

import { useRef, useState } from "react";
import { X, Zap, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const plans = [
  {
    id: "plus",
    badge: "הכי פופולרי",
    icon: Star,
    name: "מסלול משודרג פלוס",
    price: "$25",
    period: "ל-7 ימים",
    gradient: "from-orange-400 to-amber-500",
    features: [
      { text: "הקפצה אוטומטית כל 4 שעות", included: true },
      { text: "מיקום גבוה יותר מעל כולם", included: true },
      { text: "שדרוג לנראות מקסימלית", included: true },
    ],
  },
  {
    id: "basic",
    badge: null,
    icon: Zap,
    name: "הקפצה אוטומטית בלבד",
    price: "$17",
    period: "ל-7 ימים",
    gradient: "from-blue-500 to-blue-700",
    features: [
      { text: "הקפצה אוטומטית כל 4 שעות", included: true },
      { text: "מיקום גבוה יותר מעל כולם", included: false },
      { text: "שדרוג לנראות מקסימלית", included: false },
    ],
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    const index = Math.round(Math.abs(scrollLeft) / offsetWidth);
    setActiveIndex(index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center rounded-full active:bg-gray-100">
          <X size={20} className="text-gray-600" strokeWidth={2.2} />
        </button>
        <h1 className="text-base font-bold text-gray-900">שדרוג מודעה</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={72} height={28} className="object-contain" />
      </header>

      <main className="flex-1 flex flex-col items-center pt-8 pb-12">

        {/* Hero */}
        <div className="flex flex-col items-center px-6 mb-8">
          <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-4 shadow-sm">
            <span className="text-4xl select-none">🚀</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 text-center leading-snug mb-2">
            בחרתם במודעה בסיסית
          </h2>
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            שדרגו את החשיפה והגיעו ליותר מועמדים במחיר מוזל!
          </p>
        </div>

        {/* Swipeable cards */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory px-4 gap-4 pb-1"
          style={{ scrollbarWidth: "none", direction: "ltr" }}
        >
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            return (
              <div
                key={plan.id}
                className="snap-center shrink-0 w-[calc(100%-32px)] flex flex-col rounded-3xl overflow-hidden shadow-md"
                style={{ direction: "rtl" }}
              >
                {/* Card header gradient */}
                <div className={`bg-gradient-to-l ${plan.gradient} px-5 pt-5 pb-6`}>
                  {plan.badge && (
                    <div className="flex justify-end mb-3">
                      <span className="bg-white/25 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  {!plan.badge && <div className="mb-8" />}
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <h3 className="text-lg font-black text-white text-right">{plan.name}</h3>
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <PlanIcon size={18} className="text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="flex items-end justify-end gap-1 mt-3">
                    <span className="text-white/70 text-sm mb-1">{plan.period}</span>
                    <span className="text-5xl font-black text-white leading-none">{plan.price}</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="bg-white px-5 py-5 flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    {plan.features.map(({ text, included }) => (
                      <div key={text} className="flex items-center justify-end gap-3">
                        <span className={`text-sm font-medium text-right ${included ? "text-gray-800" : "text-gray-400"}`}>
                          {text}
                        </span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${included ? "bg-green-100" : "bg-red-50"}`}>
                          <span className={`text-xs font-black ${included ? "text-green-600" : "text-red-400"}`}>
                            {included ? "✓" : "✗"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className={`w-full h-14 bg-gradient-to-l ${plan.gradient} text-white font-black text-base rounded-2xl active:opacity-90 transition-opacity shadow-sm`}>
                    הרכישה ל-7 ימים
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-5">
          {plans.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${activeIndex === i ? "w-6 h-2 bg-orange-400" : "w-2 h-2 bg-gray-300"}`}
            />
          ))}
        </div>

        {/* Skip */}
        <button
          onClick={() => router.back()}
          className="mt-8 text-sm text-gray-400 active:text-gray-600 px-6 py-2"
        >
          אולי בפעם אחרת
        </button>
      </main>
    </div>
  );
}
