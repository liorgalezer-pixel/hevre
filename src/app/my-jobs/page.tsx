"use client";

import { useState, useEffect } from "react";
import { ChevronRight, X, ImageIcon, Eye, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type Job = {
  id: string;
  title: string;
  salary: string;
  companyAddress: string;
  categories: string[];
  logoPreview: string | null;
  active: boolean;
  frozen?: boolean;
};

export default function MyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});
  const [bannerVisible, setBannerVisible] = useState(true);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoggedIn(false);
        setLoaded(true);
        return;
      }
      setIsLoggedIn(true);
      const { data } = await supabase
        .from("jobs")
        .select("id, title, salary, company_address, categories, logo_url, active, frozen")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });
      const stored = (data || []).map(j => ({
        id: j.id,
        title: j.title,
        salary: j.salary || "",
        companyAddress: j.company_address || "",
        categories: j.categories || [],
        logoPreview: j.logo_url || null,
        active: j.active,
        frozen: j.frozen,
      }));
      setJobs(stored);
      if (stored.length === 0) setShowEmptyModal(true);

      // Load pending applicant counts
      if (stored.length > 0) {
        const jobIds = stored.map(j => j.id);
        const { data: apps } = await supabase
          .from("applications")
          .select("job_id")
          .in("job_id", jobIds)
          .eq("status", "pending");
        const counts: Record<string, number> = {};
        (apps || []).forEach((a: { job_id: string }) => {
          counts[a.job_id] = (counts[a.job_id] || 0) + 1;
        });
        setPendingCounts(counts);
      }

      setLoaded(true);
    })();
  }, []);

  if (!loaded) return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <div className="w-11 h-11" />
        <h1 className="text-lg font-bold text-gray-900">מודעות שפרסמתי</h1>
        <div className="w-20 h-8 bg-gray-100 rounded animate-pulse" />
      </header>
      <main className="flex-1 px-4 pt-5 pb-36 flex flex-col gap-4">
        {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />)}
      </main>
      <BottomNav />
    </div>
  );

  if (!isLoggedIn) return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.push("/profile")} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">מודעות שפרסמתי</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5 pb-24">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-black text-gray-900">יש להתחבר כדי לצפות במודעות</h2>
        <p className="text-sm text-gray-400">התחבר או צור חשבון כדי לנהל את המשרות שלך</p>
        <Link href="/login" className="w-full h-14 bg-blue-700 text-white font-bold text-base rounded-2xl flex items-center justify-center active:bg-blue-800 transition-colors">
          התחבר / הרשם
        </Link>
      </main>
      <BottomNav />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.push("/profile")} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">מודעות שפרסמתי</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>

      <main className="flex-1 px-4 pt-5 pb-36 flex flex-col gap-4">

        {/* Banner */}
        {jobs.length > 0 && bannerVisible && (
          jobs.length >= 2 ? (
            <div className="bg-blue-700 rounded-2xl px-4 py-4 flex items-center gap-3" style={{ direction: "ltr" }}>
              <button onClick={() => setBannerVisible(false)} className="shrink-0">
                <X size={18} className="text-blue-200" strokeWidth={2} />
              </button>
              <div className="flex flex-1 items-center justify-between gap-3">
                <button
                  onClick={() => router.push("/hevre-plus")}
                  className="shrink-0 bg-white text-blue-700 font-black text-sm rounded-xl px-3 py-2 active:bg-blue-50"
                >
                  Hevre ✦
                </button>
                <div className="flex flex-col items-end gap-0.5 flex-1">
                  <p className="text-sm font-black text-white text-right leading-snug">הגעת למכסת המשרות שלך</p>
                  <p className="text-xs font-medium text-blue-200 text-right leading-snug">לפתיחת עוד משרות שדרג עכשיו</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-100 border border-yellow-200 rounded-2xl px-4 py-4 flex items-start gap-3" style={{ direction: "ltr" }}>
              <button onClick={() => setBannerVisible(false)} className="mt-0.5 shrink-0">
                <X size={18} className="text-yellow-600" strokeWidth={2} />
              </button>
              <div className="flex-1 flex items-center justify-between gap-2">
                <span className="text-2xl">🔧</span>
                <p className="text-sm font-bold text-yellow-800 text-right leading-snug flex-1">
                  פרסמת עבודה אחת בחינם,<br />ניתן לפרסם עוד עבודה ללא עלות
                </p>
              </div>
            </div>
          )
        )}

        {/* Job cards */}
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3">

            {/* Top row: preview button (left) + logo (right) */}
            <div className="flex items-start justify-between gap-3" style={{ direction: "ltr" }}>
              <Link
                href={`/jobs/${job.id}/preview`}
                className="flex items-center gap-1.5 border border-blue-700 text-blue-700 font-semibold text-xs rounded-xl py-2 px-3 active:bg-blue-50 transition-colors shrink-0"
              >
                <Eye size={14} strokeWidth={2} />
                תצוגה מקדימה
              </Link>
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {job.logoPreview ? (
                  <Image src={job.logoPreview} alt="לוגו" width={56} height={56} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-gray-400" strokeWidth={1.2} />
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-black text-gray-900 text-right">{job.title}</h2>

            {/* Details */}
            <p className="text-sm text-gray-400 text-right">
              {[job.salary, job.companyAddress].filter(Boolean).join(" • ")}
            </p>

            {/* Tags */}
            <div className="flex gap-2 justify-end flex-wrap">
              {(pendingCounts[job.id] || 0) > 0 && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-orange-500 border border-orange-200 bg-orange-50 rounded-lg px-3 py-1">
                  <Users size={14} strokeWidth={2} />
                  מועמדים בהמתנה ({pendingCounts[job.id]})
                </span>
              )}
              <span className={`flex items-center gap-1.5 text-sm font-medium border rounded-lg px-3 py-1 ${job.frozen ? "text-red-500 border-gray-200" : "text-green-600 border-gray-200"}`}>
                <span className={`w-2 h-2 rounded-full inline-block ${job.frozen ? "bg-red-500" : "bg-green-500"}`} />
                {job.frozen ? "קפוא" : "פעילה"}
              </span>
              <span className="text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-1">
                מודעה בסיסית
              </span>
            </div>

            {/* CTA */}
            <Link
              href={`/jobs/${job.id}`}
              className="w-full h-13 bg-blue-800 text-white font-bold text-base rounded-xl flex items-center justify-center active:bg-blue-900 transition-colors py-3"
            >
              צפה במשרה
            </Link>
          </div>
        ))}

      </main>

      {/* Empty state modal */}
      {showEmptyModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-3xl w-full px-6 py-8 flex flex-col gap-5 shadow-xl">
              <div className="text-4xl text-center">📋</div>
              <h2 className="text-lg font-black text-gray-900 text-center leading-snug">
                ראינו שעוד לא פרסמת משרה
              </h2>
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                לפרסום משרה ראשונה לחץ כאן
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/post?new=1"
                  className="w-full h-13 bg-blue-700 text-white font-bold text-base rounded-2xl flex items-center justify-center py-3 active:bg-blue-800 transition-colors"
                >
                  פרסם משרה
                </Link>
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full h-13 border border-gray-200 text-gray-600 font-medium text-base rounded-2xl py-3 active:bg-gray-50"
                >
                  לא עכשיו
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
