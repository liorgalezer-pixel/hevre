"use client";

import { MessageCircle, Bell, Search, SlidersHorizontal, MapPin, DollarSign, Clock, Heart, X, Trash2, CheckCircle2, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Drawer } from "vaul";
import BottomNav from "@/components/BottomNav";
import { CATEGORIES } from "@/lib/categories";
import { MOCK_JOBS, MockJob } from "@/lib/mock-jobs";
import { STORAGE_KEYS, savedJobsKey } from "@/lib/storage-keys";
import { supabase } from "@/lib/supabase";
import posthog from "posthog-js";

type Filters = {
  categories: string[];
  states: string[];
  cities: string[];
  fromTime: string;
  toTime: string;
  license: boolean;
  car: boolean;
  housing: boolean;
  weekend: boolean;
  holidays: boolean;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "היום";
  if (days === 1) return "אתמול";
  if (days < 7) return `לפני ${days} ימים`;
  return `לפני ${Math.floor(days / 7)} שבועות`;
}

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [approvedApps, setApprovedApps] = useState<{ jobId: string; title: string; company: string }[]>([]);
  const [rejectedApps, setRejectedApps] = useState<{ jobId: string; title: string }[]>([]);
  const [rejectedJobIds, setRejectedJobIds] = useState<Set<string>>(new Set());
  const [newApplicants, setNewApplicants] = useState<{ jobId: string; jobTitle: string; applicantName: string }[]>([]);
  const [userJobs, setUserJobs] = useState<(MockJob & { created_at?: string })[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedStorageKey, setSavedStorageKey] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [searchText, setSearchText] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drawer state
  const [selectedJob, setSelectedJob] = useState<(MockJob & { created_at?: string }) | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.FILTERS);
    if (stored) {
      try { setFilters(JSON.parse(stored)); } catch {}
    }
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (user) {
        const sKey = savedJobsKey(user.id);
        setSavedStorageKey(sKey);
        const savedJobs: MockJob[] = JSON.parse(localStorage.getItem(sKey) || "[]");
        setSavedIds(savedJobs.map(j => j.id));

        const seekerClearedAt = localStorage.getItem("hevre_notif_cleared_at");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let seekerQuery: any = supabase
          .from("applications")
          .select("job_id, status, created_at, jobs(title, company_name)")
          .eq("applicant_id", user.id)
          .in("status", ["approved", "rejected"]);
        if (seekerClearedAt) seekerQuery = seekerQuery.gt("created_at", seekerClearedAt);
        const { data: apps } = await seekerQuery;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const approved = (apps || []).filter((a: any) => a.status === "approved").map((a: any) => ({
          jobId: a.job_id as string,
          title: (a.jobs?.title as string) || "",
          company: (a.jobs?.company_name as string) || "",
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rejected = (apps || []).filter((a: any) => a.status === "rejected").map((a: any) => ({
          jobId: a.job_id as string,
          title: (a.jobs?.title as string) || "",
        }));
        setApprovedApps(approved);
        setRejectedApps(rejected);
        const { data: allRejected } = await supabase
          .from("applications")
          .select("job_id")
          .eq("applicant_id", user.id)
          .eq("status", "rejected");
        setRejectedJobIds(new Set((allRejected || []).map((a: { job_id: string }) => a.job_id)));

        const { data: myJobs } = await supabase
          .from("jobs").select("id, title").eq("created_by", user.id);
        if (myJobs && myJobs.length > 0) {
          const jobIds = myJobs.map((j: { id: string }) => j.id);
          const clearedAt = localStorage.getItem("hevre_notif_cleared_at");
          let appsQuery = supabase
            .from("applications")
            .select("job_id, applicant_id, created_at, profiles(first_name, last_name)")
            .in("job_id", jobIds)
            .eq("status", "pending");
          if (clearedAt) appsQuery = appsQuery.gt("created_at", clearedAt);
          const { data: pendingApps } = await appsQuery;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newApps = (pendingApps || []).map((a: any) => ({
            jobId: a.job_id as string,
            jobTitle: myJobs.find((j: { id: string }) => j.id === a.job_id)?.title || "",
            applicantName: a.profiles?.first_name || "מועמד",
          }));
          setNewApplicants(newApps);
        }
      }
    });

    supabase.from("jobs")
      .select("id, title, company_name, company_address, job_cities, job_states, salary, start_time, end_time, categories, car, license, housing, weekend, description, requirements, q1, q2, q3, created_at")
      .eq("active", true)
      .eq("frozen", false)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const postedJobs = (data || []).map(j => ({
          id: j.id,
          title: j.title,
          company: j.company_name || j.company_address || "חברה",
          salary: j.salary || "",
          location: (j.job_cities?.length ? j.job_cities.join(", ") : j.company_address) || "",
          hours: j.start_time && j.end_time ? `${j.start_time}-${j.end_time}` : "",
          categories: j.categories || [],
          car: !!j.car,
          license: !!j.license,
          housing: !!j.housing,
          weekend: !!j.weekend,
          description: j.description || "",
          requirements: j.requirements || [],
          questions: [j.q1, j.q2, j.q3].filter(Boolean),
          created_at: j.created_at,
        }));
        setUserJobs(postedJobs);
      });
  }, []);

  const clearFilters = () => {
    localStorage.removeItem(STORAGE_KEYS.FILTERS);
    setFilters(null);
  };

  const toggleSave = (job: MockJob, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!savedStorageKey) { router.push("/login"); return; }
    const saved: MockJob[] = JSON.parse(localStorage.getItem(savedStorageKey) || "[]");
    const isSaved = saved.some(j => j.id === job.id);
    const updated = isSaved ? saved.filter(j => j.id !== job.id) : [...saved, job];
    localStorage.setItem(savedStorageKey, JSON.stringify(updated));
    setSavedIds(updated.map(j => j.id));
    if (!isSaved) posthog.capture("job_saved", { job_id: job.id, category: job.categories?.[0] ?? null });
  };

  const openDrawer = async (job: MockJob & { created_at?: string }) => {
    setSelectedJob(job);
    setApplySuccess(false);
    setAlreadyApplied(false);
    setAnswers(job.questions?.length ? new Array(job.questions.length).fill("") : []);
    setDrawerOpen(true);
    posthog.capture("job_viewed", { job_id: job.id, category: job.categories?.[0] ?? null, neighborhood: job.location ?? null });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("applications").select("id").eq("job_id", job.id).eq("applicant_id", user.id).maybeSingle();
      if (data) setAlreadyApplied(true);
    }
  };

  const handleQuickApply = async () => {
    if (!selectedJob) return;
    if (!isLoggedIn) { router.push("/login"); return; }
    if (selectedJob.questions?.length > 0 && answers.some(a => !a.trim())) return;

    setApplying(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setApplying(false); return; }

    const { error } = await supabase.from("applications").insert({
      job_id: selectedJob.id,
      applicant_id: user.id,
      answers: answers,
      about_self: "",
    });

    setApplying(false);
    if (!error) {
      posthog.capture("application_submitted", { job_id: selectedJob.id, category: selectedJob.categories?.[0] ?? null });
      setApplySuccess(true);
      setAlreadyApplied(true);
      setTimeout(() => setDrawerOpen(false), 1800);
    }
  };

  const hasActiveFilters = filters && (
    filters.categories.length > 0 || filters.states.length > 0 || filters.cities.length > 0 ||
    filters.license || filters.car || filters.housing || filters.weekend || filters.holidays
  );

  const allJobs = [...userJobs, ...MOCK_JOBS];
  const filtered = allJobs.filter(j => {
    if (rejectedJobIds.has(j.id)) return false;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      if (!j.title.toLowerCase().includes(q) && !j.company.toLowerCase().includes(q) && !(j.description || "").toLowerCase().includes(q)) return false;
    }
    if (activeCategory && !j.categories.includes(activeCategory)) return false;
    if (filters) {
      if (filters.categories.length > 0 && !filters.categories.some(c => j.categories.includes(c))) return false;
      if (filters.cities.length > 0 && !filters.cities.some(city => j.location.toLowerCase().includes(city.toLowerCase()))) return false;
      if (filters.license && !j.license) return false;
      if (filters.car && !j.car) return false;
      if (filters.housing && !j.housing) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-100" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-10 pb-3 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <button onClick={() => router.push("/messages")} className="relative w-11 h-11 flex items-center justify-center">
              <MessageCircle size={26} className="text-gray-700" strokeWidth={1.8} />
            </button>
            <div ref={bellRef} className="relative">
              <button onClick={() => setBellOpen((v) => !v)} className="relative w-11 h-11 flex items-center justify-center">
                <Bell size={26} className="text-gray-700" strokeWidth={1.8} />
                {(approvedApps.length > 0 || rejectedApps.length > 0 || newApplicants.length > 0) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
              </button>
              {bellOpen && (
                <div className="absolute top-12 right-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 w-72 p-4 flex flex-col gap-2" dir="rtl">
                  <div className="flex items-center justify-between mb-1" style={{ direction: "ltr" }}>
                    <button
                      onClick={() => {
                        const now = new Date().toISOString();
                        localStorage.setItem("hevre_notif_cleared_at", now);
                        setNewApplicants([]);
                        setApprovedApps([]);
                        setRejectedApps([]);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200"
                    >
                      <Trash2 size={14} className="text-gray-400" strokeWidth={1.8} />
                    </button>
                    <p className="text-sm font-bold text-gray-700">התראות</p>
                    <div className="w-7" />
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    {newApplicants.map((n) => (
                      <button key={`${n.jobId}-${n.applicantName}`} onClick={() => { setBellOpen(false); router.push(`/jobs/${n.jobId}`); }}
                        className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-right flex flex-col gap-0.5 active:bg-blue-100">
                        <span className="text-blue-700 font-bold text-xs">👤 מועמד חדש!</span>
                        <span className="text-gray-700 font-medium">{n.applicantName}</span>
                        <span className="text-gray-400 text-xs">הגיש מועמדות ל: {n.jobTitle}</span>
                      </button>
                    ))}
                    {approvedApps.map((app) => (
                      <button key={app.jobId} onClick={() => { setBellOpen(false); router.push(`/jobs/${app.jobId}/view`); }}
                        className="bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 text-right flex flex-col gap-0.5 active:bg-green-100">
                        <span className="text-green-700 font-bold text-xs">✓ מועמדות אושרה!</span>
                        <span className="text-gray-700 font-medium">{app.title}</span>
                        <span className="text-gray-400 text-xs">{app.company}</span>
                      </button>
                    ))}
                    {rejectedApps.map((app) => (
                      <button key={app.jobId} onClick={() => { setBellOpen(false); router.push(`/jobs/${app.jobId}/view`); }}
                        className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-right flex flex-col gap-0.5 active:bg-red-100">
                        <span className="text-red-600 font-bold text-xs">✗ מועמדות נדחתה</span>
                        <span className="text-gray-700 font-medium">{app.title}</span>
                      </button>
                    ))}
                    {approvedApps.length === 0 && rejectedApps.length === 0 && newApplicants.length === 0 && (
                      <p className="bg-gray-50 rounded-xl px-3 py-2.5">אין הודעות חדשות כרגע</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <Image src="/hevre-logo.png" alt="Hevre" width={100} height={40} className="object-contain" priority />
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                if (e.target.value.trim().length >= 2) {
                  searchTimerRef.current = setTimeout(() => {
                    posthog.capture("search_performed", { query: e.target.value.trim() });
                  }, 1000);
                }
              }}
              placeholder="חיפוש משרה..."
              className="w-full bg-gray-100 rounded-xl h-11 pr-9 pl-3 text-right text-sm outline-none placeholder:text-gray-400 text-gray-800"
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => router.push("/filter")} className={`relative rounded-xl px-4 h-11 flex items-center gap-1.5 font-semibold text-sm active:bg-blue-800 ${hasActiveFilters ? "bg-blue-900" : "bg-blue-700"} text-white`}>
              <SlidersHorizontal size={15} />
              סנן
              {hasActiveFilters && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-400 rounded-full text-[10px] font-black flex items-center justify-center">
                  {[filters!.categories.length, filters!.states.length, filters!.cities.length, filters!.license ? 1 : 0, filters!.car ? 1 : 0, filters!.housing ? 1 : 0, filters!.weekend ? 1 : 0, filters!.holidays ? 1 : 0].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 active:bg-red-100">
                <X size={18} className="text-red-500" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Category quick filters */}
      <div className="bg-white border-b border-gray-100 px-3 py-3">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(activeCategory === id ? null : id)}
              className={`flex flex-col items-center justify-center gap-1.5 min-w-[76px] h-[78px] rounded-2xl border shrink-0 transition-colors ${
                activeCategory === id ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
              }`}
            >
              <Icon size={26} className={activeCategory === id ? "text-blue-700" : "text-gray-600"} strokeWidth={1.5} />
              <span className={`text-xs font-medium ${activeCategory === id ? "text-blue-700" : "text-gray-700"}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Not logged in banner */}
      {isLoggedIn === false && (
        <div className="mx-3 mt-3 bg-gradient-to-l from-blue-700 to-blue-500 rounded-2xl px-4 py-4 flex items-center justify-between gap-3 shadow-md" style={{ direction: "ltr" }}>
          <button onClick={() => router.push("/login")} className="shrink-0 bg-white text-blue-700 font-black text-sm rounded-xl px-4 py-2 active:bg-blue-50">
            התחבר / הירשם
          </button>
          <div className="flex-1 flex flex-col gap-0.5" dir="rtl">
            <p className="text-white font-black text-sm leading-snug">עדיין לא מחובר לחבר׳ה?</p>
            <p className="text-blue-100 text-xs leading-snug">התחבר / הירשם בחינם עכשיו</p>
          </div>
        </div>
      )}

      {/* Jobs feed */}
      <main className="flex-1 px-3 py-4 pb-24 flex flex-col gap-3">
        <div className="text-right">
          <h1 className="text-xl font-bold text-gray-900">
            {activeCategory ? CATEGORIES.find(c => c.id === activeCategory)?.label : 'משרות ארה"ב'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} משרות פתוחות</p>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl">🔍</span>
            <p className="text-gray-400 text-sm">אין משרות בקטגוריה זו כרגע</p>
          </div>
        )}

        {filtered.map((job) => {
          const isSaved = savedIds.includes(job.id);
          return (
            <div
              key={job.id}
              onClick={() => openDrawer(job)}
              className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3 text-right w-full active:scale-[0.99] transition-transform cursor-pointer"
            >
              {/* Top row */}
              <div className="flex items-start gap-3" style={{ direction: "ltr" }}>
                <button
                  onClick={(e) => toggleSave(job, e)}
                  className="w-9 h-9 flex items-center justify-center rounded-full shrink-0"
                >
                  <Heart size={20} className={isSaved ? "text-red-500 fill-red-500" : "text-gray-300"} strokeWidth={1.8} />
                </button>
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <h2 className="text-base font-black text-gray-900 leading-snug">{job.title}</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
                  {(job as MockJob & { created_at?: string }).created_at && (
                    <p className="text-[11px] text-blue-500 font-medium mt-0.5">
                      {timeAgo((job as MockJob & { created_at?: string }).created_at!)}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-xl font-black text-blue-700">
                  {job.company[0]}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-start" dir="rtl">
                {job.salary && (
                  <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100">
                    <DollarSign size={11} strokeWidth={2.5} />{job.salary}
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
                {job.housing && <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">🏠 כולל דיור</span>}
              </div>

              {/* CTA hint */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <ChevronDown size={16} className="text-gray-300" />
                <span className="text-xs text-blue-600 font-semibold">לחץ לפרטים ולהגשת מועמדות</span>
              </div>
            </div>
          );
        })}
      </main>

      <BottomNav />

      {/* Job Details Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-t-3xl max-h-[90vh]" dir="rtl">
            <Drawer.Title className="sr-only">{selectedJob?.title ?? "פרטי משרה"}</Drawer.Title>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {selectedJob && (
              <>
                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5 pt-2 pb-32">

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4" style={{ direction: "ltr" }}>
                    <Drawer.Close className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 shrink-0">
                      <X size={18} className="text-gray-600" strokeWidth={2} />
                    </Drawer.Close>
                    <div className="flex-1 text-right">
                      <h2 className="text-xl font-black text-gray-900 leading-tight">{selectedJob.title}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{selectedJob.company}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 text-2xl font-black text-blue-700">
                      {selectedJob.company[0]}
                    </div>
                  </div>

                  {/* Key info chips */}
                  <div className="flex flex-wrap gap-2 mb-5 justify-start" dir="rtl">
                    {selectedJob.salary && (
                      <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-bold px-3 py-1.5 rounded-full border border-green-100">
                        <DollarSign size={13} strokeWidth={2.5} />{selectedJob.salary}
                      </span>
                    )}
                    {selectedJob.location && (
                      <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full">
                        <MapPin size={13} strokeWidth={2} />{selectedJob.location}
                      </span>
                    )}
                    {selectedJob.hours && (
                      <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1.5 rounded-full">
                        <Clock size={13} strokeWidth={2} />{selectedJob.hours}
                      </span>
                    )}
                    {selectedJob.car && <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1.5 rounded-full">🚗 כולל רכב</span>}
                    {selectedJob.license && <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1.5 rounded-full">🪪 דרוש רישיון</span>}
                    {selectedJob.housing && <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1.5 rounded-full">🏠 כולל דיור</span>}
                    {selectedJob.weekend && <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1.5 rounded-full">📅 עבודה בסוף שבוע</span>}
                  </div>

                  {/* Description */}
                  {selectedJob.description && (
                    <div className="mb-5">
                      <h3 className="text-base font-bold text-gray-900 mb-2">תיאור המשרה</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedJob.description}</p>
                    </div>
                  )}

                  {/* Requirements */}
                  {selectedJob.requirements?.length > 0 && (
                    <div className="mb-5">
                      <h3 className="text-base font-bold text-gray-900 mb-2">דרישות</h3>
                      <ul className="flex flex-col gap-1.5">
                        {selectedJob.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-blue-500 font-bold mt-0.5">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Questions */}
                  {selectedJob.questions?.length > 0 && !alreadyApplied && (
                    <div className="mb-5">
                      <h3 className="text-base font-bold text-gray-900 mb-3">שאלות המעסיק</h3>
                      <div className="flex flex-col gap-3">
                        {selectedJob.questions.map((q, i) => (
                          <div key={i}>
                            <label className="text-sm text-gray-600 font-medium block mb-1">{q}</label>
                            <textarea
                              value={answers[i] || ""}
                              onChange={(e) => {
                                const updated = [...answers];
                                updated[i] = e.target.value;
                                setAnswers(updated);
                              }}
                              rows={2}
                              dir="rtl"
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-right outline-none resize-none bg-gray-50 focus:border-blue-400"
                              placeholder="תשובתך..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sticky apply button */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 pb-8">
                  {applySuccess ? (
                    <div className="w-full h-14 bg-green-500 rounded-2xl flex items-center justify-center gap-2">
                      <CheckCircle2 size={22} className="text-white" strokeWidth={2} />
                      <span className="text-white font-black text-base">המועמדות נשלחה!</span>
                    </div>
                  ) : alreadyApplied ? (
                    <div className="w-full h-14 bg-gray-100 rounded-2xl flex items-center justify-center gap-2">
                      <CheckCircle2 size={20} className="text-gray-500" strokeWidth={2} />
                      <span className="text-gray-500 font-bold text-base">כבר הגשת מועמדות</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleQuickApply}
                      disabled={applying || (selectedJob.questions?.length > 0 && answers.some(a => !a.trim()))}
                      className="w-full h-14 bg-blue-700 text-white font-black text-base rounded-2xl active:bg-blue-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {applying ? (
                        <span className="animate-pulse">שולח...</span>
                      ) : (
                        <>⚡ הגשת מועמדות מהירה</>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
