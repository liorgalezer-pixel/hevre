"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronRight, Plus, Trash2, MapPin, Tag, Pencil } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">התראות</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5 pb-24">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-black text-gray-900">יש להתחבר כדי לצפות בהתראות</h2>
        <p className="text-sm text-gray-400">התחבר או צור חשבון כדי לנהל את ההתראות שלך</p>
        <Link href="/login" className="w-full h-14 bg-blue-700 text-white font-bold text-base rounded-2xl flex items-center justify-center active:bg-blue-800 transition-colors">
          התחבר / הרשם
        </Link>
      </main>
      <BottomNav />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100" dir="rtl">

      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">התראות</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>

      <main className="flex-1 px-4 pt-5 pb-28 flex flex-col gap-3">

        {alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-5">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
              <Bell size={36} className="text-blue-700" strokeWidth={1.4} />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-800 mb-1">אין התראות חדשות</h2>
              <p className="text-sm text-gray-400">צור התראה כדי לקבל עדכונים על משרות חדשות</p>
            </div>
            <button
              onClick={() => router.push("/alerts/new")}
              className="flex items-center gap-2 bg-blue-700 text-white font-bold text-base rounded-2xl px-6 py-3.5 active:bg-blue-800"
            >
              <Plus size={18} strokeWidth={2.5} />
              צור התראה חדשה
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900">ההתראות שלי</h2>
              <button
                onClick={() => router.push("/alerts/new")}
                className="flex items-center gap-1.5 bg-blue-700 text-white font-semibold text-sm rounded-xl px-4 py-2.5 active:bg-blue-800"
              >
                התראה חדשה
                <Plus size={15} strokeWidth={2.5} />
              </button>
            </div>

            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-2xl px-4 py-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 text-right">
                    <p className="text-base font-black text-gray-900">{alert.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      נוצרה ב-{new Date(alert.created_at).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Bell size={18} className="text-blue-600" strokeWidth={1.8} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 justify-start">
                  {(alert.categories || []).map((cat) => (
                    <span key={cat} className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                      <Tag size={10} strokeWidth={2} />{cat}
                    </span>
                  ))}
                  {(alert.states || []).map((s) => (
                    <span key={s} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      <MapPin size={10} strokeWidth={2} />{s}
                    </span>
                  ))}
                  {(alert.cities || []).map((c) => (
                    <span key={c} className="flex items-center gap-1 bg-gray-800 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 justify-start">
                  {alert.license && <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">רישיון נהיגה</span>}
                  {alert.car && <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">כולל רכב</span>}
                  {alert.weekend && <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">סוף שבוע</span>}
                  {alert.holidays && <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">חגים</span>}
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/alerts/new?edit=${alert.id}`)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 active:bg-blue-100"
                  >
                    <Pencil size={15} className="text-blue-600" strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(alert.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 active:bg-red-100"
                  >
                    <Trash2 size={16} className="text-red-400" strokeWidth={2} />
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
            <div className="bg-white rounded-3xl w-full px-6 py-7 flex flex-col gap-5">
              <h2 className="text-lg font-bold text-gray-900 text-center">מחיקת התראה</h2>
              <p className="text-sm text-gray-500 text-center">האם אתה בטוח שברצונך למחוק את ההתראה?</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 h-12 rounded-2xl border border-gray-300 text-gray-700 font-medium">ביטול</button>
                <button onClick={confirmDelete} className="flex-1 h-12 rounded-2xl bg-red-500 text-white font-bold active:bg-red-600">כן, מחק</button>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
