"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronLeft, Plus, Trash2, MapPin, Tag, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type Alert = {
  id: string;
  name: string;
  categories: string[];
  states: string[];
  cities: string[];
  license: boolean;
  car: boolean;
  weekend: boolean;
  holidays: boolean;
  created_at: string;
};

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoggedIn(false); setLoaded(true); return; }
      setIsLoggedIn(true);
      const { data } = await supabase.from("job_alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setAlerts(data || []);
      setLoaded(true);
    })();
  }, []);

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await supabase.from("job_alerts").delete().eq("id", confirmDeleteId);
    setAlerts(prev => prev.filter(a => a.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  if (!loaded) return null;

  if (!isLoggedIn) return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">התראות</h1>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronLeft size={24} className="text-ink-2" strokeWidth={2} />
        </button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5 pb-24">
        <div className="text-5xl">🔒</div>
        <h2 className="font-serif text-xl font-bold text-ink tracking-tight">יש להתחבר כדי לצפות בהתראות</h2>
        <p className="text-sm text-ink-3">התחבר או צור חשבון כדי לנהל את ההתראות שלך</p>
        <Link href="/login" className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl flex items-center justify-center active:bg-terracotta-deep transition-colors">
          התחבר / הרשם
        </Link>
      </main>
      <BottomNav />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">התראות</h1>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronLeft size={24} className="text-ink-2" strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 px-4 pt-5 pb-28 flex flex-col gap-3">

        {alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-5">
            <div className="w-20 h-20 bg-cream-warm rounded-full flex items-center justify-center">
              <Bell size={36} className="text-terracotta" strokeWidth={1.4} />
            </div>
            <div className="text-center">
              <h2 className="font-serif text-lg font-bold text-ink mb-1 tracking-tight">אין התראות חדשות</h2>
              <p className="text-sm text-ink-3">צור התראה כדי לקבל עדכונים על משרות חדשות</p>
            </div>
            <button
              onClick={() => router.push("/alerts/new")}
              className="flex items-center gap-2 bg-ink text-cream font-serif font-semibold text-base rounded-2xl px-6 py-3.5 active:bg-terracotta-deep"
            >
              <Plus size={18} strokeWidth={2.5} />
              צור התראה חדשה
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-serif text-lg font-bold text-ink tracking-tight">ההתראות שלי</h2>
              <button
                onClick={() => router.push("/alerts/new")}
                className="flex items-center gap-1.5 bg-ink text-cream font-serif font-semibold text-sm rounded-xl px-4 py-2.5 active:bg-terracotta-deep"
              >
                התראה חדשה
                <Plus size={15} strokeWidth={2.5} />
              </button>
            </div>

            {alerts.map((alert) => (
              <div key={alert.id} className="bg-paper rounded-2xl px-4 py-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 text-right">
                    <p className="font-serif text-base font-bold text-ink tracking-tight">{alert.name}</p>
                    <p className="font-mono text-[11px] text-ink-3 mt-0.5 uppercase tracking-wider">
                      נוצרה ב-{new Date(alert.created_at).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-cream-warm rounded-xl flex items-center justify-center shrink-0">
                    <Bell size={18} className="text-terracotta" strokeWidth={1.8} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 justify-start">
                  {(alert.categories || []).map((cat) => (
                    <span key={cat} className="flex items-center gap-1 bg-cream-warm text-ink-2 text-xs font-medium px-2.5 py-1 rounded-full">
                      <Tag size={10} strokeWidth={2} />{cat}
                    </span>
                  ))}
                  {(alert.states || []).map((s) => (
                    <span key={s} className="flex items-center gap-1 bg-cream-warm text-terracotta text-xs font-medium px-2.5 py-1 rounded-full">
                      <MapPin size={10} strokeWidth={2} />{s}
                    </span>
                  ))}
                  {(alert.cities || []).map((c) => (
                    <span key={c} className="flex items-center gap-1 bg-ink text-cream text-xs font-medium px-2.5 py-1 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 justify-start">
                  {alert.license && <span className="text-xs text-ink-2 bg-cream ring-1 ring-divider rounded-full px-2.5 py-1">רישיון נהיגה</span>}
                  {alert.car && <span className="text-xs text-ink-2 bg-cream ring-1 ring-divider rounded-full px-2.5 py-1">כולל רכב</span>}
                  {alert.weekend && <span className="text-xs text-ink-2 bg-cream ring-1 ring-divider rounded-full px-2.5 py-1">סוף שבוע</span>}
                  {alert.holidays && <span className="text-xs text-ink-2 bg-cream ring-1 ring-divider rounded-full px-2.5 py-1">חגים</span>}
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-divider">
                  <button
                    onClick={() => router.push(`/alerts/new?edit=${alert.id}`)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-cream-warm active:bg-cream"
                  >
                    <Pencil size={15} className="text-terracotta" strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(alert.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-warm-danger-bg active:bg-warm-danger-bg"
                  >
                    <Trash2 size={16} className="text-warm-danger" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      {confirmDeleteId && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setConfirmDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-paper rounded-3xl w-full px-6 py-7 flex flex-col gap-5">
              <h2 className="font-serif text-lg font-bold text-ink text-center tracking-tight">מחיקת התראה</h2>
              <p className="text-sm text-ink-2 text-center">האם אתה בטוח שברצונך למחוק את ההתראה?</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 h-12 rounded-2xl ring-1 ring-divider text-ink-2 font-medium">ביטול</button>
                <button onClick={confirmDelete} className="flex-1 h-12 rounded-2xl bg-warm-danger text-cream font-bold active:opacity-80">כן, מחק</button>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
