"use client";

import { Suspense, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function HevrePlusSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan");

  useEffect(() => {
    // Trigger deep link to return to app and close in-app browser
    window.location.href = `hevre://subscription/success?plan=${plan ?? ""}`;
  }, [plan]);

  return (
    <div className="flex flex-col min-h-screen bg-cream items-center justify-center px-6 gap-6" dir="rtl">
      <div className="w-24 h-24 rounded-full bg-warm-success-bg flex items-center justify-center">
        <CheckCircle2 size={52} className="text-warm-success" strokeWidth={1.5} />
      </div>
      <div className="text-center flex flex-col gap-2">
        <h2 className="font-serif text-2xl font-bold text-ink tracking-tight">
          ברוך הבא ל-{plan === "plus" ? "Hevre+" : "Hevre Pro"}!
        </h2>
        <p className="text-sm text-ink-2 leading-relaxed">
          {plan === "plus"
            ? "יש לך עכשיו פרסום ללא הגבלה + וי כחול בכל המשרות שלך"
            : "יש לך עכשיו גישה לפרסום עד 5 משרות בו-זמנית"}
        </p>
        <p className="text-xs text-ink-3 mt-1">המנוי יתחדש אוטומטית כל חודש</p>
      </div>
      <button
        onClick={() => router.push("/my-jobs")}
        className="w-full h-14 bg-terracotta text-cream font-serif font-semibold text-base rounded-2xl active:opacity-90"
      >
        התחל לפרסם משרות
      </button>
      <button
        onClick={() => router.push("/")}
        className="text-sm text-ink-3 underline"
      >
        חזרה לדף הבית
      </button>
    </div>
  );
}

export default function HevrePlusSuccessPage() {
  return (
    <Suspense>
      <HevrePlusSuccessContent />
    </Suspense>
  );
}
