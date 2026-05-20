"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Search, Heart, DollarSign, MapPin, Clock } from "lucide-react";
import Image from "next/image";
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
    <div className="flex flex-col min-h-screen bg-gray-100" dir="rtl">
      <header className="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
        <div className="h-8 w-24 bg-gray-100 rounded animate-pulse mx-auto" />
      </header>
      <BottomNav />
    </div>
  );

  if (!isLoggedIn) return (
    <div className="flex flex-col min-h-screen bg-gray-100" dir="rtl">
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <Image src="/hevre-logo.png" alt="Hevre" width={90} height={36} className="object-contain" />
        <div className="w-11" />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5 pb-24">
        <Heart size={64} className="text-blue-200" strokeWidth={1.2} />
        <h2 className="text-xl font-black text-gray-900">יש להתחבר כדי לשמור משרות</h2>
        <p className="text-sm text-gray-400">התחבר כדי לשמור משרות שאהבת</p>
        <Link href="/login" className="w-full h-14 bg-blue-700 text-white font-bold text-base rounded-2xl flex items-center justify-center active:bg-blue-800">
          התחבר / הרשם
        </Link>
      </main>
      <BottomNav />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100" dir="rtl">

      <header className="bg-white px-4 pt-12 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
            <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
          </button>
          <Image src="/hevre-logo.png" alt="Hevre" width={90} height={36} className="object-contain" />
          <div className="w-11" />
        </div>
        <div className="flex items-center bg-gray-100 rounded-2xl h-12 px-4 gap-3">
          <Search size={18} className="text-gray-400 shrink-0" strokeWidth={1.6} />
          <input
            type="text"
            placeholder="חיפוש במשרות שאהבתי..."
            dir="rtl"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-right text-sm outline-none bg-transparent placeholder:text-gray-400"
          />
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-28">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">{filtered.length} משרות</span>
          <h2 className="text-xl font-black text-gray-900">מודעות שאהבתי</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center gap-4">
            <Heart size={72} className="text-blue-700" strokeWidth={1.2} />
            <h3 className="text-xl font-black text-gray-900">
              {search ? "לא נמצאו תוצאות" : "עדיין לא אהבת משרה"}
            </h3>
            <p className="text-gray-400 text-base leading-relaxed">
              {search ? "נסה חיפוש אחר" : "כשתמצא משהו מעניין לחץ על הלב\nוהמשרה תישמר כאן"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(job => (
              <div key={job.id} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3" style={{ direction: "ltr" }}>
                  <button onClick={() => removeSaved(job.id)} className="w-9 h-9 flex items-center justify-center rounded-full shrink-0">
                    <Heart size={20} className="text-red-500 fill-red-500" strokeWidth={1.8} />
                  </button>
                  <div className="flex-1 text-right">
                    <h2 className="text-base font-black text-gray-900 leading-snug">{job.title}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-lg font-black text-blue-700">
                    {job.company[0]}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-start" dir="rtl">
                  {job.salary && (
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                      <DollarSign size={11} strokeWidth={2} />{job.salary}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                      <MapPin size={11} strokeWidth={2} />{job.location}
                    </span>
                  )}
                  {job.hours && (
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                      <Clock size={11} strokeWidth={2} />{job.hours}
                    </span>
                  )}
                  {job.car && <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">🚗 כולל רכב</span>}
                  {job.license && <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">🪪 דרוש רישיון</span>}
                </div>

                <button
                  onClick={() => router.push(`/jobs/${job.id}/view`)}
                  className="w-full h-12 bg-blue-700 text-white font-bold text-sm rounded-xl active:bg-blue-800 transition-colors"
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
