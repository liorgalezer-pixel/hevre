"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Search, Heart, DollarSign, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
import { savedJobsKey } from "@/lib/storage-keys";
import { MockJob } from "@/lib/mock-jobs";

export default function SavedPage() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<MockJob[]>([]);
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setIsLoggedIn(false);
        setLoaded(true);
        return;
      }
      setIsLoggedIn(true);
      const key = savedJobsKey(user.id);
      setStorageKey(key);
      const jobs: MockJob[] = JSON.parse(localStorage.getItem(key) || "[]");
      setSavedJobs(jobs);
      setLoaded(true);
    });
  }, []);

  const removeSaved = (jobId: string) => {
    if (!storageKey) return;
    const updated = savedJobs.filter(j => j.id !== jobId);
    setSavedJobs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const filtered = savedJobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  );

  if (!loaded) return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
      <header className="bg-paper px-4 pt-12 pb-4 border-b border-divider">
        <div className="h-8 w-24 bg-cream-warm rounded animate-pulse mx-auto" />
      </header>
      <BottomNav />
    </div>
  );

  if (!isLoggedIn) return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-ink-2" strokeWidth={2} />
        </button>
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <div className="w-11" />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5 pb-24">
        <Heart size={64} className="text-terracotta opacity-30" strokeWidth={1.2} />
        <h2 className="font-serif text-xl font-bold text-ink tracking-tight">יש להתחבר כדי לשמור משרות</h2>
        <p className="text-sm text-ink-3">התחבר כדי לשמור משרות שאהבת</p>
        <Link href="/login" className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl flex items-center justify-center active:bg-terracotta-deep">
          התחבר / הרשם
        </Link>
      </main>
      <BottomNav />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      <header className="bg-paper px-4 pt-12 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
            <ChevronRight size={24} className="text-ink-2" strokeWidth={2} />
          </button>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
          </div>
          <div className="w-11" />
        </div>
        <div className="flex items-center bg-cream-warm ring-1 ring-divider rounded-2xl h-12 px-4 gap-3">
          <Search size={18} className="text-ink-3 shrink-0" strokeWidth={1.6} />
          <input
            type="text"
            placeholder="חיפוש במשרות שאהבתי..."
            dir="rtl"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-right text-sm outline-none bg-transparent placeholder:text-ink-3"
          />
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-28">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-ink tracking-tight">מודעות שאהבתי</h2>
          <span className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">{filtered.length} משרות</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center gap-4">
            <Heart size={72} className="text-terracotta" strokeWidth={1.2} />
            <h3 className="font-serif text-xl font-bold text-ink tracking-tight">
              {search ? "לא נמצאו תוצאות" : "עדיין לא אהבת משרה"}
            </h3>
            <p className="text-ink-3 text-base leading-relaxed">
              {search ? "נסה חיפוש אחר" : "כשתמצא משהו מעניין לחץ על הלב\nוהמשרה תישמר כאן"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(job => (
              <div key={job.id} className="bg-paper rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3" style={{ direction: "ltr" }}>
                  <button onClick={() => removeSaved(job.id)} className="w-9 h-9 flex items-center justify-center rounded-full shrink-0">
                    <Heart size={20} className="text-warm-danger fill-warm-danger" strokeWidth={1.8} />
                  </button>
                  <div className="flex-1 text-right">
                    <h2 className="font-serif text-base font-bold text-ink leading-snug tracking-tight">{job.title}</h2>
                    <p className="text-sm text-ink-2 mt-0.5">{job.company}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cream-warm flex items-center justify-center shrink-0 font-serif text-lg font-bold text-terracotta">
                    {job.company[0]}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-start" dir="rtl">
                  {job.salary && (
                    <span className="flex items-center gap-1 bg-cream-warm text-ink-2 text-xs font-medium px-2.5 py-1 rounded-full">
                      <DollarSign size={11} strokeWidth={2} />{job.salary}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1 bg-cream-warm text-ink-2 text-xs font-medium px-2.5 py-1 rounded-full">
                      <MapPin size={11} strokeWidth={2} />{job.location}
                    </span>
                  )}
                  {job.hours && (
                    <span className="flex items-center gap-1 bg-cream-warm text-ink-2 text-xs font-medium px-2.5 py-1 rounded-full">
                      <Clock size={11} strokeWidth={2} />{job.hours}
                    </span>
                  )}
                  {job.car && <span className="bg-cream-warm text-ink-2 text-xs font-medium px-2.5 py-1 rounded-full">🚗 כולל רכב</span>}
                  {job.license && <span className="bg-cream-warm text-ink-2 text-xs font-medium px-2.5 py-1 rounded-full">🪪 דרוש רישיון</span>}
                </div>

                <button
                  onClick={() => router.push(`/jobs/${job.id}/view`)}
                  className="w-full h-12 bg-ink text-cream font-serif font-semibold text-sm rounded-xl active:bg-terracotta-deep transition-colors"
                >
                  צפה במשרה
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
