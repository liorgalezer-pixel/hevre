"use client";

import { Suspense, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

function UpgradeSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const tier = params.get("tier");
  const jobId = params.get("job");

  useEffect(() => {
    posthog.capture("upgrade_purchase_completed", { job_id: jobId, plan: tier });
    // Redirect back to native app via deep link
    window.location.href = `hevre://upgrade/success?job=${jobId}&tier=${tier}`;
  }, [jobId, tier]);

  return (
    <div className="flex flex-col min-h-screen bg-cream items-center justify-center px-6 gap-6" dir="rtl">
      <div className="w-24 h-24 rounded-full bg-warm-success-bg flex items-center justify-center">
        <CheckCircle2 size={52} className="text-warm-success" strokeWidth={1.5} />
      </div>
      <div className="text-center flex flex-col gap-2">
        <h2 className="font-serif text-2xl font-bold text-ink tracking-tight">המודעה שודרגה!</h2>
        <p className="text-sm text-ink-2 leading-relaxed">
          {tier === "featured"
            ? "המודעה שלך תופיע ראשונה עם חשיפה מקסימלית"
            : "המודעה שלך תקפץ אוטומטית כל 4 שעות"}
        </p>
        <p className="text-xs text-ink-3 mt-1">השדרוג פעיל ל-7 ימים</p>
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

export default function UpgradeSuccessPage() {
  return (
    <Suspense>
      <UpgradeSuccessContent />
    </Suspense>
  );
}
