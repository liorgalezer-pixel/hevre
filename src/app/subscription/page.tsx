"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Crown, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type Subscription = {
  plan: string;
  status: string;
  current_period_end: string;
};

const PLAN_LABELS: Record<string, string> = {
  plus: "Hevre+",
  pro: "Hevre Pro",
};

const PLAN_PRICES: Record<string, string> = {
  plus: "$29.99",
  pro: "$15",
};

const PLAN_FEATURES: Record<string, string[]> = {
  plus: ["פרסום משרות ללא הגבלה", "וי כחול ואימות עסק", "חשיפה מקסימלית בפיד", "תמיכה VIP"],
  pro: ["עד 5 משרות פעילות בו-זמנית", "חשיפה מוגברת בפיד", "תמיכה מועדפת"],
};

export default function SubscriptionPage() {
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status, current_period_end")
        .eq("user_id", user.id)
        .in("status", ["active", "canceling"])
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      setSub(data || null);
      setLoading(false);
    })();
  }, []);

  const handleCancel = async () => {
    if (!userId) return;
    setCancelling(true);
    const res = await fetch("/api/stripe/cancel-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setCancelled(true);
      setSub(prev => prev ? { ...prev, status: "canceling" } : null);
    }
    setCancelling(false);
    setCancelConfirm(false);
  };

  const endDate = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">המנוי שלי</h1>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronLeft size={24} className="text-ink-2" strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 px-4 pt-6 pb-28 flex flex-col gap-5">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !sub ? (
          /* No active subscription */
          <div className="flex flex-col items-center justify-center flex-1 gap-5 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-cream-warm flex items-center justify-center">
              <Crown size={36} className="text-ink-3" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-xl font-bold text-ink tracking-tight">אין מנוי פעיל</h2>
              <p className="text-sm text-ink-3">שדרג כדי לפרסם יותר משרות ולהגיע ליותר מועמדים</p>
            </div>
            <button
              onClick={() => router.push("/hevre-plus")}
              className="w-full h-14 bg-terracotta text-cream font-serif font-semibold text-base rounded-2xl active:opacity-90"
            >
              בחר מסלול
            </button>
          </div>
        ) : (
          <>
            {/* Plan card */}
            <div className={`rounded-3xl overflow-hidden ring-2 ${sub.plan === "plus" ? "ring-terracotta" : "ring-ink"}`}>
              <div className={`px-5 pt-5 pb-6 ${sub.plan === "plus" ? "bg-terracotta" : "bg-ink"}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-white/20 text-cream text-xs font-semibold px-3 py-1 rounded-full">
                    {sub.status === "canceling" ? "מסתיים בקרוב" : "פעיל ✓"}
                  </span>
                  <Crown size={22} className="text-cream/80" strokeWidth={1.8} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-cream tracking-tight">{PLAN_LABELS[sub.plan] || sub.plan}</h2>
                <div className="flex items-end gap-1 mt-1">
                  <span className="font-serif text-3xl font-bold text-cream leading-none">{PLAN_PRICES[sub.plan]}</span>
                  <span className="text-cream/60 text-sm mb-0.5">לחודש</span>
                </div>
              </div>

              <div className="bg-paper px-5 py-4 flex flex-col gap-2.5">
                {(PLAN_FEATURES[sub.plan] || []).map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-warm-success shrink-0" strokeWidth={2} />
                    <span className="text-sm text-ink-2">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing info */}
            <div className="bg-paper rounded-2xl px-4 py-4 ring-1 ring-divider flex flex-col gap-2">
              <p className="text-sm font-semibold text-ink">פרטי חיוב</p>
              {sub.status === "canceling" ? (
                <div className="flex items-start gap-2">
                  <AlertCircle size={15} className="text-terracotta shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-sm text-ink-2">
                    המנוי בוטל — הגישה שלך פעילה עד <span className="font-bold text-ink">{endDate}</span>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-ink-2">
                  חידוש אוטומטי ב-<span className="font-bold text-ink">{endDate}</span>
                </p>
              )}
            </div>

            {cancelled && (
              <div className="bg-warm-success-bg rounded-2xl px-4 py-3 ring-1 ring-warm-success-border text-center">
                <p className="text-sm text-warm-success font-semibold">המנוי בוטל בהצלחה — הגישה פעילה עד {endDate}</p>
              </div>
            )}

            {/* Upgrade if on Pro */}
            {sub.plan === "pro" && sub.status !== "canceling" && (
              <button
                onClick={() => router.push("/hevre-plus")}
                className="w-full h-13 py-3.5 bg-terracotta text-cream font-serif font-semibold text-base rounded-2xl active:opacity-90"
              >
                שדרג ל-Hevre+ — $29.99/חודש
              </button>
            )}

            {/* Cancel button */}
            {sub.status === "active" && (
              <button
                onClick={() => setCancelConfirm(true)}
                className="w-full h-12 rounded-2xl bg-cream ring-1 ring-divider text-sm text-ink-2 font-semibold active:opacity-70"
              >
                ביטול מנוי
              </button>
            )}
          </>
        )}
      </main>

      <BottomNav />

      {/* Cancel confirmation modal */}
      {cancelConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => !cancelling && setCancelConfirm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6" dir="rtl">
            <div className="bg-paper rounded-3xl w-full max-w-sm p-6 flex flex-col gap-5 shadow-2xl">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-warm-danger-bg flex items-center justify-center">
                  <AlertCircle size={26} className="text-warm-danger" strokeWidth={2} />
                </div>
                <h2 className="font-serif text-lg font-bold text-ink tracking-tight">ביטול מנוי</h2>
                <p className="text-sm text-ink-2 leading-relaxed">
                  האם אתה בטוח? הגישה שלך תישאר פעילה עד <span className="font-bold text-ink">{endDate}</span> ואחר כך המנוי יסתיים.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirm(false)}
                  disabled={cancelling}
                  className="flex-1 h-12 rounded-2xl bg-cream font-semibold text-sm text-ink ring-1 ring-divider active:opacity-80 disabled:opacity-50"
                >
                  שמור את המנוי
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 h-12 rounded-2xl bg-warm-danger text-white font-semibold text-sm active:opacity-80 disabled:opacity-50 flex items-center justify-center"
                >
                  {cancelling ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "כן, בטל"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
