"use client";

import { MessageCircle, Bell, Search, SlidersHorizontal, MapPin, DollarSign, Clock, Heart, X, Trash2, CheckCircle2, Share2, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";

import { Drawer } from "vaul";
import BottomNav from "@/components/BottomNav";
import { CATEGORIES } from "@/lib/categories";
import { MOCK_JOBS, MockJob } from "@/lib/mock-jobs";
import { STORAGE_KEYS, savedJobsKey } from "@/lib/storage-keys";
import { supabase } from "@/lib/supabase";
import posthog from "posthog-js";
import { shareJob } from "@/lib/share";

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

/* Stable pastel avatar from company name — replaces the hard-coded blue avatar. */
function CompanyAvatar({ name, size = 48, radius = 12 }: { name: string; size?: number; radius?: number }) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = (hash * 47) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `oklch(0.94 0.04 ${hue})`,
        color: `oklch(0.45 0.13 ${hue})`,
      }}
      className="flex items-center justify-center font-serif font-bold shrink-0"
    >
      <span style={{ fontSize: size * 0.42 }}>{name[0]}</span>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const [bellSeen, setBellSeen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [approvedApps, setApprovedApps] = useState<{ jobId: string; title: string; company: string }[]>([]);
  const [rejectedApps, setRejectedApps] = useState<{ jobId: string; title: string }[]>([]);
  const [expiredApps, setExpiredApps] = useState<{ jobId: string; title: string }[]>([]);
  const [rejectedJobIds, setRejectedJobIds] = useState<Set<string>>(new Set());
  const [newApplicants, setNewApplicants] = useState<{ jobId: string; applicantId: string; jobTitle: string; applicantName: string }[]>([]);
  const [alertNotifs, setAlertNotifs] = useState<{ id: string; jobId: string; jobTitle: string; alertName: string }[]>([]);
  const [userJobs, setUserJobs] = useState<(MockJob & { created_at?: string })[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [savedStorageKey, setSavedStorageKey] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [searchText, setSearchText] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dbPage, setDbPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(false);
  const [totalJobCount, setTotalJobCount] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const pullStartY = useRef(0);
  const PAGE_SIZE = 20;

  // Drawer state
  const [selectedJob, setSelectedJob] = useState<(MockJob & { created_at?: string }) | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [cancelDrawerModal, setCancelDrawerModal] = useState(false);
  const [drawerCooldownUntil, setDrawerCooldownUntil] = useState<Date | null>(null);
  const [isOwnJob, setIsOwnJob] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSent, setReportSent] = useState(false);
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

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.FILTERS) {
        try { setFilters(e.newValue ? JSON.parse(e.newValue) : null); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (user) {
        const sKey = savedJobsKey(user.id);
        setSavedStorageKey(sKey);
        const savedJobs: MockJob[] = JSON.parse(localStorage.getItem(sKey) || "[]");
        setSavedIds(savedJobs.map(j => j.id));

        const dismissedIds: string[] = JSON.parse(localStorage.getItem("hevre_notif_dismissed") || "[]");
        const dismissedApplicants: string[] = JSON.parse(localStorage.getItem("hevre_dismissed_applicants") || "[]");

        // Fetch all data in parallel — including profile for notifications_cleared_at
        const [allAppsRes, alertNotifRes, myJobsRes, profileRes] = await Promise.all([
          supabase
            .from("applications")
            .select("job_id, status, jobs(title, company_name)")
            .eq("applicant_id", user.id)
            .in("status", ["approved", "rejected", "expired", "pending"]),
          supabase
            .from("alert_notifications")
            .select("id, job_id, job_title, alert_name")
            .eq("user_id", user.id)
            .eq("read", false)
            .order("created_at", { ascending: false }),
          supabase
            .from("jobs")
            .select("id, title")
            .eq("created_by", user.id),
          supabase
            .from("profiles")
            .select("notifications_cleared_at")
            .eq("id", user.id)
            .single(),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clearedAt: string | null = (profileRes.data as any)?.notifications_cleared_at || localStorage.getItem("hevre_notif_cleared_at");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allApps: any[] = allAppsRes.data || [];

        // Derive all app-related state from single query
        setAppliedJobIds(new Set(allApps.map((a) => a.job_id as string)));
        setRejectedJobIds(new Set(allApps.filter((a) => a.status === "rejected").map((a) => a.job_id as string)));

        // Bell notifications — filter dismissed client-side
        const undismissed = allApps.filter((a) => !dismissedIds.includes(a.job_id));
        setApprovedApps(undismissed.filter((a) => a.status === "approved").map((a) => ({
          jobId: a.job_id as string,
          title: (a.jobs?.title as string) || "",
          company: (a.jobs?.company_name as string) || "",
        })));
        setRejectedApps(undismissed.filter((a) => a.status === "rejected").map((a) => ({
          jobId: a.job_id as string,
          title: (a.jobs?.title as string) || "",
        })));
        setExpiredApps(undismissed.filter((a) => a.status === "expired").map((a) => ({
          jobId: a.job_id as string,
          title: (a.jobs?.title as string) || "",
        })));

        setAlertNotifs((alertNotifRes.data || []).map((n: { id: string; job_id: string; job_title: string; alert_name: string }) => ({
          id: n.id,
          jobId: n.job_id,
          jobTitle: n.job_title,
          alertName: n.alert_name,
        })));

        const myJobs = myJobsRes.data || [];
        if (myJobs.length > 0) {
          const jobIds = myJobs.map((j: { id: string }) => j.id);
          let pendingQuery = supabase
            .from("applications")
            .select("job_id, applicant_id, created_at, profiles(first_name, last_name)")
            .in("job_id", jobIds)
            .eq("status", "pending");
          if (clearedAt) pendingQuery = pendingQuery.gt("created_at", clearedAt);
          const { data: pendingApps } = await pendingQuery;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newApps = (pendingApps || [])
            .filter((a: any) => !dismissedApplicants.includes(`${a.job_id}:${a.applicant_id}`))
            .map((a: any) => ({
              jobId: a.job_id as string,
              applicantId: a.applicant_id as string,
              jobTitle: myJobs.find((j: { id: string }) => j.id === a.job_id)?.title || "",
              applicantName: a.profiles?.first_name || "מועמד",
            }));
          setNewApplicants(newApps);
        }
      }
    });

    fetchJobs(0, true);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const fetchJobs = async (page: number, reset: boolean) => {
    if (reset) {
      setLoadingMore(false);
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("active", true).eq("frozen", false)
        .then(({ count }) => { if (count !== null) setTotalJobCount(count); });
    } else setLoadingMore(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)("get_sorted_jobs", { p_page: page, p_page_size: PAGE_SIZE });
    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const postedJobs = (data || []).map((j: any) => ({
      id: j.id,
      title: j.title,
      company: j.company_name || j.company_address || "חברה",
      salary: j.salary || "",
      location: (j.job_cities?.length ? j.job_cities.join(", ") : j.company_address) || "",
      states: j.job_states || [],
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
      isFeatured: j.boost_tier === "featured" && j.boosted_until && new Date(j.boosted_until) > now,
      isBoosted: j.boost_tier === "bump" && j.boosted_until && new Date(j.boosted_until) > now,
      created_by: j.created_by,
    }));
    if (error) { setJobsError(true); setJobsLoading(false); return; }
    setUserJobs(prev => reset ? postedJobs : [...prev, ...postedJobs]);
    setHasMore((data || []).length === PAGE_SIZE);
    setDbPage(page);
    setLoadingMore(false);
    setJobsLoading(false);
  };


  useEffect(() => {
    if (!hasMore || jobsLoading || searchText || activeCategory || filters) return;
    let called = false;
    const tryLoad = () => {
      if (called) return;
      const el = document.documentElement;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 500;
      if (!atBottom) return;
      called = true;
      fetchJobs(dbPage + 1, false);
    };
    document.addEventListener("scroll", tryLoad, { passive: true });
    return () => document.removeEventListener("scroll", tryLoad);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userJobs.length, hasMore, jobsLoading, searchText, activeCategory, filters]);

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
    setIsOwnJob(false);
    setDrawerCooldownUntil(null);
    setAnswers(job.questions?.length ? new Array(job.questions.length).fill("") : []);
    setDrawerOpen(true);
    posthog.capture("job_viewed", { job_id: job.id, category: job.categories?.[0] ?? null, neighborhood: job.location ?? null });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((job as any).created_by === user.id) { setIsOwnJob(true); return; }
      const [{ data }, { data: cooldown }] = await Promise.all([
        supabase.from("applications").select("id, status").eq("job_id", job.id).eq("applicant_id", user.id).maybeSingle(),
        supabase.from("application_cooldowns").select("cancelled_at").eq("job_id", job.id).eq("applicant_id", user.id).maybeSingle(),
      ]);
      if (data) {
        setAlreadyApplied(true);
        setApplicationId(data.id);
        setApplicationStatus(data.status);
      }
      console.log("cooldown fetch result:", cooldown);
      if (cooldown) {
        const until = new Date(new Date(cooldown.cancelled_at).getTime() + 48 * 60 * 60 * 1000);
        console.log("cooldown until:", until, "now:", new Date(), "active:", until > new Date());
        if (until > new Date()) setDrawerCooldownUntil(until);
      }
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
      // Notify employer (fire-and-forget)
      fetch("https://eywrpbhgvuuupyunalaq.supabase.co/functions/v1/smart-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: selectedJob.id, applicant_id: user.id }),
      }).catch(() => {});
      setApplySuccess(true);
      setAlreadyApplied(true);
      setAppliedJobIds(prev => new Set([...prev, selectedJob.id]));
      setTimeout(() => setDrawerOpen(false), 1800);
    }
  };

  const hasActiveFilters = filters && (
    filters.categories.length > 0 || filters.states.length > 0 || filters.cities.length > 0 ||
    filters.license || filters.car || filters.housing || filters.weekend || filters.holidays
  );

  const allJobs = useMemo(() => [...userJobs, ...MOCK_JOBS], [userJobs]);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return allJobs.filter(j => {
      if (rejectedJobIds.has(j.id)) return false;
      if (q) {
        if (!j.title.toLowerCase().includes(q) && !j.company.toLowerCase().includes(q) && !(j.description || "").toLowerCase().includes(q)) return false;
      }
      if (activeCategory && !j.categories.includes(activeCategory)) return false;
      if (filters) {
        if (filters.categories.length > 0 && !filters.categories.some(c => j.categories.includes(c))) return false;
        if (filters.states.length > 0 && !(j as MockJob & { states?: string[] }).states?.some(s => filters.states.includes(s))) return false;
        if (filters.cities.length > 0 && !filters.cities.some(city => j.location.toLowerCase().includes(city.toLowerCase()))) return false;
        if (filters.license && !j.license) return false;
        if (filters.car && !j.car) return false;
        if (filters.housing && !j.housing) return false;
      }
      return true;
    });
  }, [allJobs, searchText, activeCategory, filters, rejectedJobIds]);

  const handleTouchStart = (e: React.TouchEvent) => {
    pullStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    const pullDistance = e.changedTouches[0].clientY - pullStartY.current;
    if (pullDistance > 80 && window.scrollY === 0 && !refreshing) {
      setRefreshing(true);
      await fetchJobs(0, true);
      setRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      {/* Header */}
      <header className="bg-paper px-4 pt-10 pb-3 sticky top-0 z-40 border-b border-divider">
        <div className="flex items-center justify-between mb-3">
          {/* Right side: wordmark logo */}
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-2xl font-bold text-ink tracking-tight">Hevre</span>
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
          </div>
          {/* Left side: messages + bell */}
          <div className="flex items-center gap-1">
            <button onClick={() => router.push("/messages")} className="relative w-11 h-11 flex items-center justify-center">
              <MessageCircle size={24} className="text-ink" strokeWidth={1.8} />
            </button>
            <div ref={bellRef} className="relative">
              <button onClick={() => { setBellOpen((v) => !v); setBellSeen(true); }} className="relative w-11 h-11 flex items-center justify-center">
                <Bell size={24} className="text-ink" strokeWidth={1.8} />
                {!bellSeen && (approvedApps.length > 0 || rejectedApps.length > 0 || expiredApps.length > 0 || newApplicants.length > 0 || alertNotifs.length > 0) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-terracotta rounded-full" />
                )}
              </button>
              {bellOpen && (
                <div className="absolute top-12 left-0 z-50 bg-paper rounded-2xl shadow-xl ring-1 ring-divider w-72 p-4 flex flex-col gap-2" dir="rtl">
                  <div className="flex items-center justify-between mb-1" style={{ direction: "ltr" }}>
                    <button
                      onClick={async () => {
                        const { data: { user: u } } = await supabase.auth.getUser();
                        const now = new Date().toISOString();
                        // Save cleared_at to Supabase (persists across sessions)
                        if (u) {
                          await supabase.from("profiles").update({ notifications_cleared_at: now }).eq("id", u.id);
                        }
                        localStorage.setItem("hevre_notif_cleared_at", now);
                        const existingDismissed: string[] = JSON.parse(localStorage.getItem("hevre_notif_dismissed") || "[]");
                        localStorage.setItem("hevre_notif_dismissed", JSON.stringify([...new Set([...existingDismissed, ...approvedApps.map(a => a.jobId), ...rejectedApps.map(a => a.jobId), ...expiredApps.map(a => a.jobId)])]));
                        const existingDismissedApplicants: string[] = JSON.parse(localStorage.getItem("hevre_dismissed_applicants") || "[]");
                        localStorage.setItem("hevre_dismissed_applicants", JSON.stringify([...new Set([...existingDismissedApplicants, ...newApplicants.map(n => `${n.jobId}:${n.applicantId}`)])]));
                        setNewApplicants([]);
                        setApprovedApps([]);
                        setRejectedApps([]);
                        setExpiredApps([]);
                        if (alertNotifs.length > 0) {
                          await supabase.from("alert_notifications").update({ read: true }).in("id", alertNotifs.map(n => n.id));
                          setAlertNotifs([]);
                        }
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-cream"
                    >
                      <Trash2 size={14} className="text-ink-3" strokeWidth={1.8} />
                    </button>
                    <p className="font-serif text-base font-semibold text-ink">התראות</p>
                    <div className="w-7" />
                  </div>
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {newApplicants.map((n) => (
                      <div key={`${n.jobId}-${n.applicantName}`} className="relative">
                        <button onClick={() => { setBellOpen(false); router.push(`/jobs/${n.jobId}`); }}
                          className="w-full bg-warm-info-bg ring-1 ring-divider rounded-xl px-3 pl-9 py-2.5 text-right flex flex-col gap-0.5 active:bg-cream">
                          <span className="text-warm-info-text font-bold text-xs">👤 מועמד חדש!</span>
                          <span className="text-ink font-medium text-sm">{n.applicantName}</span>
                          <span className="text-ink-3 text-xs">הגיש מועמדות ל: {n.jobTitle}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const existing: string[] = JSON.parse(localStorage.getItem("hevre_dismissed_applicants") || "[]");
                            localStorage.setItem("hevre_dismissed_applicants", JSON.stringify([...new Set([...existing, `${n.jobId}:${n.applicantId}`])]));
                            setNewApplicants(prev => prev.filter(x => !(x.jobId === n.jobId && x.applicantId === n.applicantId)));
                          }}
                          className="absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10"
                        >
                          <Trash2 size={13} className="text-ink-3" strokeWidth={1.8} />
                        </button>
                      </div>
                    ))}
                    {approvedApps.map((app) => (
                      <div key={app.jobId} className="relative">
                        <button onClick={() => { setBellOpen(false); router.push(`/jobs/${app.jobId}/view`); }}
                          className="w-full bg-warm-success-bg ring-1 ring-warm-success-border rounded-xl px-3 pl-9 py-2.5 text-right flex flex-col gap-0.5">
                          <span className="text-warm-success font-bold text-xs">✓ מועמדות אושרה!</span>
                          <span className="text-ink font-medium text-sm">{app.title}</span>
                          <span className="text-ink-3 text-xs">{app.company}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const existing: string[] = JSON.parse(localStorage.getItem("hevre_notif_dismissed") || "[]");
                            localStorage.setItem("hevre_notif_dismissed", JSON.stringify([...new Set([...existing, app.jobId])]));
                            setApprovedApps(prev => prev.filter(a => a.jobId !== app.jobId));
                          }}
                          className="absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10"
                        >
                          <Trash2 size={13} className="text-ink-3" strokeWidth={1.8} />
                        </button>
                      </div>
                    ))}
                    {rejectedApps.map((app) => (
                      <div key={app.jobId} className="relative">
                        <button onClick={() => { setBellOpen(false); router.push(`/jobs/${app.jobId}/view`); }}
                          className="w-full bg-warm-danger-bg ring-1 ring-warm-danger-border rounded-xl px-3 pl-9 py-2.5 text-right flex flex-col gap-0.5">
                          <span className="text-warm-danger font-bold text-xs">✗ משרת {app.title} לא אישרה אותך</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const existing: string[] = JSON.parse(localStorage.getItem("hevre_notif_dismissed") || "[]");
                            localStorage.setItem("hevre_notif_dismissed", JSON.stringify([...new Set([...existing, app.jobId])]));
                            setRejectedApps(prev => prev.filter(a => a.jobId !== app.jobId));
                          }}
                          className="absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10"
                        >
                          <Trash2 size={13} className="text-ink-3" strokeWidth={1.8} />
                        </button>
                      </div>
                    ))}
                    {expiredApps.map((app) => (
                      <div key={app.jobId} className="relative">
                        <button onClick={() => { setBellOpen(false); router.push(`/jobs/${app.jobId}/view`); }}
                          className="w-full bg-cream ring-1 ring-divider rounded-xl px-3 pl-9 py-2.5 text-right flex flex-col gap-0.5">
                          <span className="text-ink-2 font-bold text-xs">⏰ המועמדות למשרת {app.title} בוטלה</span>
                          <span className="text-ink-3 text-xs">עקב חוסר מענה תוך 48 שעות מרגע הבקשה</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const existing: string[] = JSON.parse(localStorage.getItem("hevre_notif_dismissed") || "[]");
                            localStorage.setItem("hevre_notif_dismissed", JSON.stringify([...new Set([...existing, app.jobId])]));
                            setExpiredApps(prev => prev.filter(a => a.jobId !== app.jobId));
                          }}
                          className="absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10"
                        >
                          <Trash2 size={13} className="text-ink-3" strokeWidth={1.8} />
                        </button>
                      </div>
                    ))}
                    {alertNotifs.map((n) => (
                      <div key={n.id} className="relative">
                        <button onClick={() => { setBellOpen(false); router.push(`/jobs/${n.jobId}/view`); }}
                          className="w-full bg-warm-purple-bg ring-1 ring-divider rounded-xl px-3 pl-9 py-2.5 text-right flex flex-col gap-0.5">
                          <span className="text-warm-purple font-bold text-xs">🔔 משרה חדשה מתאימה!</span>
                          <span className="text-ink font-medium text-sm">{n.jobTitle}</span>
                          <span className="text-ink-3 text-xs">התראה: {n.alertName}</span>
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await supabase.from("alert_notifications").update({ read: true }).eq("id", n.id);
                            setAlertNotifs(prev => prev.filter(a => a.id !== n.id));
                          }}
                          className="absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10"
                        >
                          <Trash2 size={13} className="text-ink-3" strokeWidth={1.8} />
                        </button>
                      </div>
                    ))}
                    {approvedApps.length === 0 && rejectedApps.length === 0 && expiredApps.length === 0 && newApplicants.length === 0 && alertNotifs.length === 0 && (
                      <p className="bg-cream rounded-xl px-3 py-2.5 text-ink-3 text-sm">אין הודעות חדשות כרגע</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3" />
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
              className="w-full bg-cream rounded-xl h-11 pr-9 pl-3 text-right text-sm outline-none placeholder:text-ink-3 text-ink"
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => router.push("/filter")} className={`relative rounded-xl px-4 h-11 flex items-center gap-1.5 font-semibold text-sm text-white ${hasActiveFilters ? "bg-ink active:bg-ink/90" : "bg-terracotta active:bg-terracotta-deep"}`}>
              <SlidersHorizontal size={15} />
              סנן
              {hasActiveFilters && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-terracotta-deep rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-paper">
                  {[filters!.categories.length, filters!.states.length, filters!.cities.length, filters!.license ? 1 : 0, filters!.car ? 1 : 0, filters!.housing ? 1 : 0, filters!.weekend ? 1 : 0, filters!.holidays ? 1 : 0].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="w-11 h-11 flex items-center justify-center rounded-xl bg-warm-danger-bg active:opacity-80">
                <X size={18} className="text-warm-danger" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Category quick filters */}
      <div className="bg-paper border-b border-divider px-3 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(activeCategory === id ? null : id)}
              className={`flex flex-col items-center justify-center gap-1.5 min-w-[80px] h-[84px] rounded-2xl shrink-0 transition-colors ${
                activeCategory === id
                  ? "bg-terracotta text-white"
                  : "bg-paper ring-1 ring-divider text-ink"
              }`}
            >
              <Icon size={24} strokeWidth={activeCategory === id ? 2 : 1.6} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Not logged in banner */}
      {isLoggedIn === false && (
        <div className="mx-3 mt-3 bg-ink rounded-2xl px-4 py-4 flex items-center justify-between gap-3" style={{ direction: "ltr" }}>
          <button onClick={() => router.push("/login")} className="shrink-0 bg-terracotta text-white font-serif font-semibold text-sm rounded-xl px-4 py-2 active:bg-terracotta-deep">
            התחבר / הירשם
          </button>
          <div className="flex-1 flex flex-col gap-0.5" dir="rtl">
            <p className="text-cream font-serif font-semibold text-base leading-snug">עדיין לא מחובר לחבר׳ה?</p>
            <p className="text-cream/60 text-xs leading-snug">התחבר / הירשם בחינם עכשיו</p>
          </div>
        </div>
      )}

      {(refreshing || jobsLoading) && !jobsError && (
        <div className="flex justify-center py-3">
          <div className="w-5 h-5 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Jobs feed */}
      <main className="flex-1 px-3 py-4 pb-24 flex flex-col gap-3">
        <div className="text-right">
          <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">
            {activeCategory ? CATEGORIES.find(c => c.id === activeCategory)?.label : 'משרות ארה"ב'}
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3 mt-1.5">{totalJobCount ?? filtered.length} משרות פתוחות</p>
        </div>

        {jobsError && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <span className="text-4xl">⚠️</span>
            <p className="text-ink-2 text-sm text-center">לא ניתן לטעון משרות כרגע</p>
            <button
              onClick={() => { setJobsError(false); setJobsLoading(true); fetchJobs(0, true); }}
              className="h-11 px-6 bg-ink text-cream font-serif font-semibold text-sm rounded-2xl active:opacity-90"
            >
              נסה שוב
            </button>
          </div>
        )}


        {!jobsLoading && !jobsError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl">🔍</span>
            <p className="text-ink-3 text-sm">אין משרות בקטגוריה זו כרגע</p>
          </div>
        )}

        {!jobsLoading && !jobsError && filtered.map((job) => {
          const isSaved = savedIds.includes(job.id);
          const isApplied = appliedJobIds.has(job.id);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const isFeatured = (job as any).isFeatured;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const isBoosted = (job as any).isBoosted;
          return (
            <div
              key={job.id}
              onClick={() => openDrawer(job)}
              className={`rounded-2xl p-4 flex flex-col gap-3 text-right w-full active:scale-[0.99] transition-transform cursor-pointer ${
                isFeatured
                  ? "bg-[#FFF8F0] ring-2 ring-terracotta shadow-lg shadow-terracotta/20"
                  : "bg-paper ring-1 ring-divider"
              }`}
            >
              {/* Featured badge */}
              {isFeatured && (
                <div className="flex items-center gap-1.5 -mb-1">
                  <span className="text-xs font-bold text-terracotta tracking-wide">✦ מודעה אטרקטיבית</span>
                </div>
              )}


              {/* Top row */}
              <div className="flex items-start gap-3" style={{ direction: "ltr" }}>
                <button
                  onClick={(e) => toggleSave(job, e)}
                  className="w-9 h-9 flex items-center justify-center rounded-full shrink-0"
                >
                  <Heart
                    size={20}
                    className={isSaved ? "text-terracotta fill-terracotta" : "text-ink-3"}
                    strokeWidth={1.8}
                  />
                </button>
                <div className="flex-1 text-right">
                  <h2 className="font-serif text-base font-semibold text-ink leading-snug tracking-tight">{job.title}</h2>
                  <p className="text-sm text-ink-2 mt-0.5">{job.company}</p>
                  {(job as MockJob & { created_at?: string }).created_at && (
                    <p className="font-mono text-[11px] text-terracotta font-semibold mt-1 tracking-wide uppercase">
                      {timeAgo((job as MockJob & { created_at?: string }).created_at!)}
                    </p>
                  )}
                </div>
                <CompanyAvatar name={job.company} size={48} />
              </div>

              {/* Applied badge */}
              {isApplied && (
                <div className="bg-warm-success-bg ring-1 ring-warm-success-border rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <span className="text-warm-success text-xs font-bold">✓ מועמדות הוגשה</span>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 justify-start" dir="rtl">
                {job.salary && (
                  <span className="flex items-center gap-1 bg-warm-success-bg text-warm-success text-xs font-bold px-2.5 py-1 rounded-full ring-1 ring-warm-success-border">
                    <DollarSign size={11} strokeWidth={2.5} />{job.salary}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1 bg-cream text-ink-2 text-xs font-medium px-2.5 py-1 rounded-full">
                    <MapPin size={11} strokeWidth={2} />{job.location}
                  </span>
                )}
                {job.hours && (
                  <span className="flex items-center gap-1 bg-cream text-ink-2 text-xs font-medium px-2.5 py-1 rounded-full">
                    <Clock size={11} strokeWidth={2} />{job.hours}
                  </span>
                )}
                {job.car && <span className="bg-cream text-ink-2 text-xs font-medium px-2.5 py-1 rounded-full">🚗 כולל רכב</span>}
                {job.license && <span className="bg-cream text-ink-2 text-xs font-medium px-2.5 py-1 rounded-full">🪪 דרוש רישיון</span>}
                {job.housing && <span className="bg-cream text-ink-2 text-xs font-medium px-2.5 py-1 rounded-full">🏠 מספק דיור</span>}
              </div>
            </div>
          );
        })}

        {loadingMore && (
          <div className="flex items-center justify-center py-6">
            <span className="w-6 h-6 border-2 border-divider border-t-terracotta rounded-full animate-spin" />
          </div>
        )}
      </main>

      <BottomNav />

      {/* Job Details Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-ink/40 z-40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-paper rounded-t-3xl max-h-[90vh]" dir="rtl">
            <Drawer.Title className="sr-only">{selectedJob?.title ?? "פרטי משרה"}</Drawer.Title>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-divider rounded-full" />
            </div>

            {selectedJob && (
              <>
                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5 pt-2 pb-32">

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4" style={{ direction: "ltr" }}>
                    <Drawer.Close className="w-9 h-9 flex items-center justify-center rounded-full bg-cream active:bg-cream-warm shrink-0">
                      <X size={18} className="text-ink-2" strokeWidth={2} />
                    </Drawer.Close>
                    <button
                      onClick={async () => {
                        const url = `${window.location.origin}/jobs/${selectedJob.id}/view`;
                        await shareJob(selectedJob.title, url);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-cream active:bg-cream-warm shrink-0"
                    >
                      <Share2 size={18} className="text-ink-2" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => { setReportReason(""); setReportDetails(""); setReportSent(false); setReportOpen(true); }}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-cream active:bg-cream-warm shrink-0"
                    >
                      <Flag size={16} className="text-ink-3" strokeWidth={1.8} />
                    </button>
                    <div className="flex-1 text-right">
                      <h2 className="font-serif text-2xl font-bold text-ink leading-tight tracking-tight">{selectedJob.title}</h2>
                      <p className="text-sm text-ink-2 mt-0.5">{selectedJob.company}</p>
                    </div>
                    <CompanyAvatar name={selectedJob.company} size={56} radius={14} />
                  </div>

                  {/* Key info chips */}
                  <div className="flex flex-wrap gap-2 mb-5 justify-start" dir="rtl">
                    {selectedJob.salary && (
                      <span className="flex items-center gap-1.5 bg-warm-success-bg text-warm-success text-sm font-bold px-3 py-1.5 rounded-full ring-1 ring-warm-success-border">
                        <DollarSign size={13} strokeWidth={2.5} />{selectedJob.salary}
                      </span>
                    )}
                    {selectedJob.location && (
                      <span className="flex items-center gap-1.5 bg-warm-info-bg text-warm-info-text text-sm font-semibold px-3 py-1.5 rounded-full">
                        <MapPin size={13} strokeWidth={2} />{selectedJob.location}
                      </span>
                    )}
                    {selectedJob.hours && (
                      <span className="flex items-center gap-1.5 bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">
                        <Clock size={13} strokeWidth={2} />{selectedJob.hours}
                      </span>
                    )}
                    {selectedJob.car && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">🚗 כולל רכב</span>}
                    {selectedJob.license && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">🪪 דרוש רישיון</span>}
                    {selectedJob.housing && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">🏠 מספק דיור</span>}
                    {selectedJob.weekend && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">📅 עבודה בסוף שבוע</span>}
                  </div>

                  {/* Description */}
                  {selectedJob.description && (
                    <div className="mb-5">
                      <h3 className="font-serif text-base font-semibold text-ink mb-2 tracking-tight">תיאור המשרה</h3>
                      <p className="text-sm text-ink-2 leading-relaxed">{selectedJob.description}</p>
                    </div>
                  )}

                  {/* Requirements */}
                  {selectedJob.requirements?.length > 0 && (
                    <div className="mb-5">
                      <h3 className="font-serif text-base font-semibold text-ink mb-2 tracking-tight">דרישות</h3>
                      <ul className="flex flex-col gap-1.5">
                        {selectedJob.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
                            <span className="text-warm-success font-bold mt-0.5">✓</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Questions */}
                  {selectedJob.questions?.length > 0 && !alreadyApplied && (
                    <div className="mb-5">
                      <h3 className="font-serif text-base font-semibold text-ink mb-3 tracking-tight">שאלות המעסיק</h3>
                      <div className="flex flex-col gap-3">
                        {selectedJob.questions.map((q, i) => (
                          <div key={i}>
                            <label className="text-sm text-ink font-medium block mb-1">
                              <span className="font-mono text-[10px] text-terracotta font-bold ml-1.5">0{i + 1}</span>
                              {q}
                            </label>
                            <textarea
                              value={answers[i] || ""}
                              onChange={(e) => {
                                const updated = [...answers];
                                updated[i] = e.target.value;
                                setAnswers(updated);
                              }}
                              rows={2}
                              dir="rtl"
                              className="w-full ring-1 ring-divider rounded-xl px-3 py-2 text-sm text-right outline-none resize-none bg-cream text-ink focus:ring-terracotta focus:ring-2"
                              placeholder="תשובתך..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sticky apply button */}
                <div className="absolute bottom-0 left-0 right-0 bg-paper border-t border-divider px-5 py-4 pb-8">
                  {applySuccess ? (
                    <div className="w-full h-14 bg-warm-success rounded-2xl flex items-center justify-center gap-2">
                      <CheckCircle2 size={22} className="text-white" strokeWidth={2} />
                      <span className="text-white font-serif font-semibold text-base">המועמדות נשלחה!</span>
                    </div>
                  ) : isOwnJob ? (
                    <div className="w-full h-14 bg-cream rounded-2xl flex items-center justify-center px-4">
                      <span className="text-ink-3 font-medium text-sm text-center">את/ה לא יכול/ה להגיש מועמדות לעצמך</span>
                    </div>
                  ) : alreadyApplied ? (
                    <div className="flex flex-col gap-2">
                      <div className="w-full h-14 bg-cream rounded-2xl flex items-center justify-center gap-2">
                        <CheckCircle2 size={20} className="text-ink-2" strokeWidth={2} />
                        <span className="text-ink-2 font-semibold text-base">כבר הגשת מועמדות</span>
                      </div>
                      {applicationStatus === "pending" && (
                        <button onClick={() => setCancelDrawerModal(true)} className="w-full h-10 rounded-2xl bg-warm-danger-bg text-warm-danger font-semibold text-sm flex items-center justify-center gap-1.5 ring-1 ring-warm-danger-border">
                          <X size={14} strokeWidth={2.5} /> ביטול מועמדות
                        </button>
                      )}
                    </div>
                  ) : drawerCooldownUntil ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-full h-14 bg-gray-100 text-gray-400 font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed">
                        🚫 לא ניתן להגיש מועמדות כרגע
                      </div>
                      <p className="text-xs text-ink-3 text-center">
                        ביטלת מועמדות — ניתן להגיש שוב ב-{drawerCooldownUntil.toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleQuickApply}
                      disabled={applying || (selectedJob.questions?.length > 0 && answers.some(a => !a.trim()))}
                      className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl active:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {applying ? (
                        <span className="animate-pulse">שולח...</span>
                      ) : (
                        <>הגשת מועמדות מהירה <span className="text-terracotta">⚡</span></>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Cancel application drawer */}
      <Drawer.Root open={cancelDrawerModal} onOpenChange={(open) => { if (!open) setCancelDrawerModal(false); }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-ink/40 z-[60]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[60] bg-paper rounded-t-3xl px-5 pt-4 pb-10 flex flex-col gap-5" dir="rtl">
            <Drawer.Title className="sr-only">ביטול מועמדות</Drawer.Title>
            <div className="w-10 h-1 bg-divider rounded-full mx-auto" />
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-warm-danger-bg flex items-center justify-center">
                <X size={26} className="text-warm-danger" strokeWidth={2} />
              </div>
              <h2 className="font-serif text-lg font-bold text-ink tracking-tight">ביטול מועמדות</h2>
              <p className="text-sm text-ink-2 leading-relaxed">
                האם אתה בטוח שאתה רוצה לבטל את המועמדות ל<span className="font-bold text-ink">{selectedJob?.title}</span>?
              </p>
            </div>
            <div className="flex gap-3">
              <Drawer.Close className="flex-1 h-12 rounded-2xl bg-cream font-semibold text-sm text-ink">לא</Drawer.Close>
              <button
                onClick={async () => {
                  if (!applicationId) return;
                  const { data: { user: u } } = await supabase.auth.getUser();
                  await supabase.from("applications").delete().eq("id", applicationId).eq("applicant_id", u?.id!);
                  const now = new Date();
                  const until = new Date(now.getTime() + 48 * 60 * 60 * 1000);
                  if (selectedJob && u) {
                    await supabase.from("application_cooldowns").delete().eq("applicant_id", u.id).eq("job_id", selectedJob.id);
                    await supabase.from("application_cooldowns").insert({ applicant_id: u.id, job_id: selectedJob.id, cancelled_at: now.toISOString() });
                  }
                  setAlreadyApplied(false);
                  setDrawerCooldownUntil(until);
                  if (selectedJob) setAppliedJobIds(prev => { const n = new Set(prev); n.delete(selectedJob.id); return n; });
                  setCancelDrawerModal(false);
                }}
                className="flex-1 h-12 rounded-2xl bg-warm-danger text-white font-semibold text-sm"
              >
                כן, בטל
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Report Drawer */}
      <Drawer.Root open={reportOpen} onOpenChange={(open) => { if (!open) { setReportOpen(false); setReportSent(false); } }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-ink/40 z-[60]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[60] bg-paper rounded-t-3xl px-5 pt-4 pb-10 flex flex-col gap-4" dir="rtl">
            <Drawer.Title className="sr-only">דיווח על מודעה</Drawer.Title>
            <div className="w-10 h-1 bg-divider rounded-full mx-auto mb-1" />
            {reportSent ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <span className="text-4xl">✅</span>
                <p className="font-serif text-lg font-bold text-ink">הדיווח נשלח</p>
                <p className="text-sm text-ink-3 text-center">תודה על הדיווח, נבדוק אותו בהקדם</p>
                <Drawer.Close className="mt-2 h-12 px-8 bg-ink text-cream font-serif font-semibold rounded-2xl">סגור</Drawer.Close>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-lg font-bold text-ink">דיווח על מודעה</h2>
                <div className="flex flex-wrap gap-2">
                  {["מידע שגוי / מטעה", "מודעה כפולה", "תוכן לא הולם", "הונאה / מרמה", "אחר"].map(r => (
                    <button key={r} onClick={() => setReportReason(r)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium ring-1 transition-colors ${reportReason === r ? "bg-terracotta text-cream ring-terracotta" : "bg-cream text-ink ring-divider"}`}>
                      {r}
                    </button>
                  ))}
                </div>
                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder="פרט את הבעיה..."
                  rows={3}
                  className="w-full ring-1 ring-divider rounded-xl px-3 py-2.5 text-sm text-right resize-none outline-none bg-cream text-ink focus:ring-terracotta focus:ring-2"
                />
                <button
                  disabled={!reportReason || !reportDetails.trim()}
                  onClick={async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    await supabase.from("job_reports").insert({ job_id: selectedJob!.id, reporter_id: user?.id ?? null, reason: reportReason, details: reportDetails.trim() });
                    setReportSent(true);
                  }}
                  className="w-full h-13 bg-warm-danger text-white font-serif font-semibold rounded-2xl py-3 disabled:opacity-40"
                >
                  שלח דיווח
                </button>
              </>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
