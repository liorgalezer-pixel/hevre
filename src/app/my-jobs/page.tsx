"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, X, ImageIcon, Eye, Users, DollarSign, MapPin, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Drawer } from "vaul";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type Job = {
  id: string;
  title: string;
  salary: string;
  companyAddress: string;
  companyName: string;
  categories: string[];
  logoPreview: string | null;
  active: boolean;
  frozen?: boolean;
  boostTier: string | null;
  boostedUntil: string | null;
};

type PreviewJob = Job & {
  description: string;
  requirements: string[];
  jobCities: string[];
  startTime: string;
  endTime: string;
  car: boolean;
  license: boolean;
  housing: boolean;
  weekend: boolean;
  q1?: string;
  q2?: string;
  q3?: string;
};

function CompanyAvatar({ name, size = 56 }: { name: string; size?: number }) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = (hash * 47) % 360;
  return (
    <div
      style={{ width: size, height: size, borderRadius: 14, background: `oklch(0.94 0.04 ${hue})`, color: `oklch(0.45 0.13 ${hue})` }}
      className="flex items-center justify-center font-serif font-bold shrink-0"
    >
      <span style={{ fontSize: size * 0.42 }}>{name[0]}</span>
    </div>
  );
}

export default function MyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});
  const [bannerVisible, setBannerVisible] = useState(true);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [previewJob, setPreviewJob] = useState<PreviewJob | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoggedIn(false); setLoaded(true); return; }
      setIsLoggedIn(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase.from("jobs").select("*").eq("created_by", user.id).order("created_at", { ascending: false }) as { data: any[]; error: any };
      if (error) { setLoaded(true); return; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stored = (data || []).map((j: any) => ({
        id: j.id, title: j.title, salary: j.salary || "",
        companyAddress: j.company_address || "", companyName: j.company_name || "",
        categories: j.categories || [], logoPreview: j.logo_url || null,
        active: j.active, frozen: j.frozen,
        boostTier: j.boost_tier || null, boostedUntil: j.boosted_until || null,
      }));
      setJobs(stored);
      if (stored.length === 0) setShowEmptyModal(true);
      if (stored.length > 0) {
        const { data: apps } = await supabase.from("applications").select("job_id").in("job_id", stored.map(j => j.id)).eq("status", "pending");
        const counts: Record<string, number> = {};
        (apps || []).forEach((a: { job_id: string }) => { counts[a.job_id] = (counts[a.job_id] || 0) + 1; });
        setPendingCounts(counts);
      }
      setLoaded(true);
    })();
  }, []);

  const openPreview = async (job: Job) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await supabase.from("jobs").select("*").eq("id", job.id).single() as { data: any };
    if (!data) return;
    setPreviewJob({
      ...job,
      description: data.description || "",
      requirements: data.requirements || [],
      jobCities: data.job_cities || [],
      startTime: data.start_time || "",
      endTime: data.end_time || "",
      car: !!data.car, license: !!data.license,
      housing: !!data.housing, weekend: !!data.weekend,
      q1: data.q1 || undefined, q2: data.q2 || undefined, q3: data.q3 || undefined,
    });
    setDrawerOpen(true);
  };

  if (!loaded) return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="flex items-baseline gap-1"><span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span><span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" /></div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">מודעות שפרסמתי</h1>
        <div className="w-11 h-11" />
      </header>
      <main className="flex-1 px-4 pt-5 pb-36 flex flex-col gap-4">
        {[1, 2].map(i => (
          <div key={i} className="bg-paper rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
            <div className="flex items-start justify-between gap-3" style={{ direction: "ltr" }}>
              <div className="h-8 w-28 bg-cream-warm rounded-xl" /><div className="w-14 h-14 rounded-xl bg-cream-warm shrink-0" />
            </div>
            <div className="h-5 bg-cream-warm rounded-lg w-3/4 self-end" />
            <div className="h-3 bg-cream-warm rounded-lg w-1/3 self-end" />
            <div className="h-12 bg-cream-warm rounded-xl" />
          </div>
        ))}
      </main>
      <BottomNav />
    </div>
  );

  if (!isLoggedIn) return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="flex items-baseline gap-1"><span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span><span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" /></div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">מודעות שפרסמתי</h1>
        <button onClick={() => router.push("/profile")} className="w-11 h-11 flex items-center justify-center"><ChevronLeft size={24} className="text-ink-2" strokeWidth={2} /></button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5 pb-24">
        <div className="text-5xl">🔒</div>
        <h2 className="font-serif text-xl font-bold text-ink tracking-tight">יש להתחבר כדי לצפות במודעות</h2>
        <Link href="/login" className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl flex items-center justify-center active:bg-terracotta-deep transition-colors">התחבר / הרשם</Link>
      </main>
      <BottomNav />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="flex items-baseline gap-1"><span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span><span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" /></div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">מודעות שפרסמתי</h1>
        <button onClick={() => router.push("/profile")} className="w-11 h-11 flex items-center justify-center"><ChevronLeft size={24} className="text-ink-2" strokeWidth={2} /></button>
      </header>

      <main className="flex-1 px-4 pt-5 pb-36 flex flex-col gap-4">

        {/* Banner */}
        {jobs.length > 0 && bannerVisible && (
          jobs.length >= 2 ? (
            <div className="bg-terracotta rounded-2xl px-4 py-4 flex items-center gap-3" style={{ direction: "ltr" }}>
              <button onClick={() => setBannerVisible(false)} className="shrink-0"><X size={18} className="text-cream opacity-60" strokeWidth={2} /></button>
              <div className="flex flex-1 items-center justify-between gap-3">
                <button onClick={() => router.push("/hevre-plus")} className="shrink-0 bg-paper text-terracotta font-black text-sm rounded-xl px-3 py-2 active:bg-cream">Hevre ✦</button>
                <div className="flex flex-col items-end gap-0.5 flex-1">
                  <p className="text-sm font-black text-cream text-right leading-snug">הגעת למכסת המשרות שלך</p>
                  <p className="text-xs font-medium text-cream opacity-70 text-right leading-snug">לפתיחת עוד משרות שדרג עכשיו</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-warm-info-bg ring-1 ring-warm-info-text/20 rounded-2xl px-4 py-4 flex items-start gap-3" style={{ direction: "ltr" }}>
              <button onClick={() => setBannerVisible(false)} className="mt-0.5 shrink-0"><X size={18} className="text-warm-info-text" strokeWidth={2} /></button>
              <div className="flex-1 flex items-center justify-between gap-2">
                <span className="text-2xl">🔧</span>
                <p className="text-sm font-bold text-warm-info-text text-right leading-snug flex-1">פרסמת עבודה אחת בחינם,<br />ניתן לפרסם עוד עבודה ללא עלות</p>
              </div>
            </div>
          )
        )}

        {/* Job cards */}
        {jobs.map((job) => {
          const now = new Date();
          const isActiveBoosted = !!job.boostedUntil && new Date(job.boostedUntil) > now;
          const isFeatured = isActiveBoosted && job.boostTier === "featured";
          return (
            <div key={job.id} className={`rounded-2xl p-5 shadow-sm flex flex-col gap-3 ${isFeatured ? "bg-[#FFF8F0] ring-2 ring-terracotta" : "bg-paper"}`}>

              <div className="flex items-start justify-between gap-3" style={{ direction: "ltr" }}>
                <button
                  onClick={() => openPreview(job)}
                  className="flex items-center gap-1.5 ring-1 ring-divider text-ink-2 font-semibold text-xs rounded-xl py-2 px-3 active:bg-cream transition-colors shrink-0"
                >
                  <Eye size={14} strokeWidth={2} />
                  תצוגה מקדימה
                </button>
                <div className="w-14 h-14 rounded-xl bg-cream-warm flex items-center justify-center overflow-hidden shrink-0">
                  {job.logoPreview
                    ? <Image src={job.logoPreview} alt="לוגו" width={56} height={56} className="w-full h-full object-cover" />
                    : <ImageIcon size={24} className="text-ink-3" strokeWidth={1.2} />}
                </div>
              </div>

              <h2 className="font-serif text-xl font-bold text-ink text-right tracking-tight">{job.title}</h2>
              <p className="text-sm text-ink-3 text-right">{[job.salary, job.companyAddress].filter(Boolean).join(" • ")}</p>

              <div className="flex gap-2 justify-end flex-wrap">
                {(pendingCounts[job.id] || 0) > 0 && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-orange-500 border border-orange-200 bg-orange-50 rounded-lg px-3 py-1">
                    <Users size={14} strokeWidth={2} />מועמדים בהמתנה ({pendingCounts[job.id]})
                  </span>
                )}
                <span className={`flex items-center gap-1.5 text-sm font-medium ring-1 ring-divider rounded-lg px-3 py-1 ${job.frozen ? "text-warm-danger" : "text-warm-success"}`}>
                  <span className={`w-2 h-2 rounded-full inline-block ${job.frozen ? "bg-warm-danger" : "bg-warm-success"}`} />
                  {job.frozen ? "קפוא" : "פעילה"}
                </span>
                {isActiveBoosted ? (
                  <span className="font-mono text-[11px] text-terracotta ring-1 ring-terracotta bg-[#FFF0E6] rounded-lg px-3 py-1 font-bold flex items-center gap-1">
                    ✦ {isFeatured ? "גיוס מהיר" : "בוסט"}{" · "}
                    {(() => {
                      const diff = new Date(job.boostedUntil!).getTime() - Date.now();
                      const hours = Math.floor(diff / 3600000);
                      if (hours < 24) { const mins = Math.floor((diff % 3600000) / 60000); return `${hours}:${String(mins).padStart(2, "0")} שע׳`; }
                      return `${Math.floor(diff / 86400000)} ימים`;
                    })()}
                  </span>
                ) : (
                  <span className="font-mono text-[11px] text-ink-2 ring-1 ring-divider rounded-lg px-3 py-1 uppercase tracking-wider">מודעה בסיסית</span>
                )}
              </div>

              <Link href={`/jobs/${job.id}`} className="w-full h-13 bg-ink text-cream font-serif font-semibold text-base rounded-xl flex items-center justify-center active:bg-terracotta-deep transition-colors py-3">
                צפה במשרה
              </Link>
            </div>
          );
        })}
      </main>

      {/* Empty state modal */}
      {showEmptyModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-paper rounded-3xl w-full px-6 py-8 flex flex-col gap-5 shadow-xl">
              <div className="text-4xl text-center">📋</div>
              <h2 className="font-serif text-lg font-bold text-ink text-center leading-snug tracking-tight">ראינו שעוד לא פרסמת משרה</h2>
              <p className="text-sm text-ink-2 text-center leading-relaxed">לפרסום משרה ראשונה לחץ כאן</p>
              <div className="flex flex-col gap-3">
                <Link href="/post?new=1" className="w-full h-13 bg-ink text-cream font-serif font-semibold text-base rounded-2xl flex items-center justify-center py-3 active:bg-terracotta-deep transition-colors">פרסם משרה</Link>
                <button onClick={() => router.push("/profile")} className="w-full h-13 ring-1 ring-divider text-ink-2 font-medium text-base rounded-2xl py-3 active:bg-cream">לא עכשיו</button>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav />

      {/* Preview Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-ink/40 z-40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-paper rounded-t-3xl max-h-[90vh]" dir="rtl">
            <Drawer.Title className="sr-only">תצוגה מקדימה</Drawer.Title>
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-divider rounded-full" />
            </div>

            {/* Preview banner */}
            <div className="bg-terracotta/10 border-b border-terracotta/20 px-4 py-2 flex items-center justify-center gap-2 shrink-0">
              <span className="text-terracotta text-xs font-semibold">👁 תצוגה מקדימה — כך המשרה נראית למחפשי עבודה</span>
            </div>

            {previewJob && (
              <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32">

                {/* Header */}
                <div className="flex items-start gap-3 mb-4" style={{ direction: "ltr" }}>
                  <Drawer.Close className="w-9 h-9 flex items-center justify-center rounded-full bg-cream active:bg-cream-warm shrink-0">
                    <X size={18} className="text-ink-2" strokeWidth={2} />
                  </Drawer.Close>
                  <div className="flex-1 text-right">
                    <h2 className="font-serif text-2xl font-bold text-ink leading-tight tracking-tight">{previewJob.title}</h2>
                    <p className="text-sm text-ink-2 mt-0.5">{previewJob.companyName || previewJob.companyAddress}</p>
                  </div>
                  <CompanyAvatar name={previewJob.companyName || previewJob.title} size={56} />
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5 justify-start" dir="rtl">
                  {previewJob.salary && (
                    <span className="flex items-center gap-1.5 bg-warm-success-bg text-warm-success text-sm font-bold px-3 py-1.5 rounded-full ring-1 ring-warm-success-border">
                      <DollarSign size={13} strokeWidth={2.5} />{previewJob.salary}
                    </span>
                  )}
                  {(previewJob.jobCities?.length ? previewJob.jobCities.join(", ") : previewJob.companyAddress) && (
                    <span className="flex items-center gap-1.5 bg-warm-info-bg text-warm-info-text text-sm font-semibold px-3 py-1.5 rounded-full">
                      <MapPin size={13} strokeWidth={2} />{previewJob.jobCities?.length ? previewJob.jobCities.join(", ") : previewJob.companyAddress}
                    </span>
                  )}
                  {previewJob.startTime && previewJob.endTime && (
                    <span className="flex items-center gap-1.5 bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">
                      <Clock size={13} strokeWidth={2} />{previewJob.startTime}-{previewJob.endTime}
                    </span>
                  )}
                  {previewJob.car && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">🚗 כולל רכב</span>}
                  {previewJob.license && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">🪪 דרוש רישיון</span>}
                  {previewJob.housing && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">🏠 מספק דיור</span>}
                  {previewJob.weekend && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">📅 עבודה בסוף שבוע</span>}
                </div>

                {/* Description */}
                {previewJob.description && (
                  <div className="mb-5">
                    <h3 className="font-serif text-base font-semibold text-ink mb-2 tracking-tight">תיאור המשרה</h3>
                    <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">{previewJob.description}</p>
                  </div>
                )}

                {/* Requirements */}
                {previewJob.requirements?.length > 0 && (
                  <div className="mb-5">
                    <h3 className="font-serif text-base font-semibold text-ink mb-2 tracking-tight">דרישות</h3>
                    <ul className="flex flex-col gap-1.5">
                      {previewJob.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
                          <span className="text-warm-success font-bold mt-0.5">✓</span>{req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Questions */}
                {[previewJob.q1, previewJob.q2, previewJob.q3].filter((q): q is string => !!q).length > 0 && (
                  <div className="mb-5">
                    <h3 className="font-serif text-base font-semibold text-ink mb-3 tracking-tight">שאלות המעסיק</h3>
                    <div className="flex flex-col gap-3">
                      {[previewJob.q1, previewJob.q2, previewJob.q3].filter((q): q is string => !!q).map((q, i) => (
                        <div key={i}>
                          <label className="text-sm text-ink font-medium block mb-1">
                            <span className="font-mono text-[10px] text-terracotta font-bold ml-1.5">0{i + 1}</span>{q}
                          </label>
                          <div className="w-full ring-1 ring-divider rounded-xl px-3 py-2 text-sm text-ink-3 bg-cream">תשובתך...</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Disabled apply button */}
            <div className="absolute bottom-0 left-0 right-0 bg-paper border-t border-divider px-5 py-4 pb-8">
              <p className="text-center text-xs text-terracotta font-semibold mb-2">תצוגה מקדימה — הכפתור אינו פעיל</p>
              <div className="w-full h-14 bg-ink/30 text-cream/60 font-serif font-semibold text-base rounded-2xl flex items-center justify-center cursor-not-allowed">
                ⚡ הגשת מועמדות מהירה
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
