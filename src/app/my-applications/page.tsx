"use client";

import { useState, useEffect } from "react";
import { MapPin, DollarSign, MessageSquare, ChevronRight, ChevronDown, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type Application = {
  jobId: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  date: string;
  logo: string;
  status?: "pending" | "approved" | "rejected";
  conversationId?: string;
};

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-cream-warm text-ink-2 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ring-1 ring-divider">
      {children}
    </span>
  );
}

export default function MyApplicationsPage() {
  const router = useRouter();
  const [pendingOpen, setPendingOpen] = useState(true);
  const [approvedOpen, setApprovedOpen] = useState(true);
  const [rejectedOpen, setRejectedOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoggedIn(false); return; }
      setIsLoggedIn(true);
      const { data } = await supabase
        .from("applications")
        .select("id, job_id, status, created_at, jobs(title, company_name, company_address, salary)")
        .eq("applicant_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch conversations for approved apps
      const { data: convs } = await supabase
        .from("conversations")
        .select("id, job_id")
        .eq("applicant_id", user.id);
      const convByJob: Record<string, string> = {};
      (convs || []).forEach((c: { id: string; job_id: string }) => { convByJob[c.job_id] = c.id; });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apps: Application[] = (data || []).map((a: any) => ({
        jobId: a.job_id,
        title: a.jobs?.title || "",
        company: a.jobs?.company_name || a.jobs?.company_address || "",
        salary: a.jobs?.salary || "",
        location: a.jobs?.company_address || "",
        date: new Date(a.created_at).toLocaleDateString("he-IL"),
        logo: (a.jobs?.company_name || "?")[0],
        status: (a.status as "pending" | "approved" | "rejected") || "pending",
        conversationId: convByJob[a.job_id],
      }));
      setApplications(apps);
    })();
  }, []);

  const pending = applications.filter(a => !a.status || a.status === "pending");
  const approved = applications.filter(a => a.status === "approved");
  const rejected = applications.filter(a => a.status === "rejected");

  if (isLoggedIn === null) return null;

  if (!isLoggedIn) return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <button onClick={() => router.push("/profile")} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-ink-2" strokeWidth={2} />
        </button>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">מועמדות למשרות שלי</h1>
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5 pb-24">
        <div className="text-5xl">🔒</div>
        <h2 className="font-serif text-xl font-bold text-ink tracking-tight">יש להתחבר כדי לצפות במועמדויות</h2>
        <p className="text-sm text-ink-3">התחבר או צור חשבון כדי לעקוב אחרי המועמדויות שלך</p>
        <Link href="/login" className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl flex items-center justify-center active:bg-terracotta-deep transition-colors">
          התחבר / הרשם
        </Link>
      </main>
      <BottomNav />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      {/* Header */}
      <header className="bg-paper px-4 pt-12 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push("/profile")} className="w-11 h-11 flex items-center justify-center">
            <ChevronRight size={24} className="text-ink-2" strokeWidth={2} />
          </button>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-28">
        <h1 className="font-serif text-2xl font-bold text-ink text-right mb-5 tracking-tight">מועמדות למשרות שלי</h1>

        {/* Pending */}
        <button onClick={() => setPendingOpen((v) => !v)} className="flex flex-row-reverse items-center justify-between mb-3 w-full">
          <ChevronDown size={18} className={`text-ink-2 transition-transform ${pendingOpen ? "" : "-rotate-90"}`} strokeWidth={2} />
          <p className="text-base font-bold text-ink-2">משרות בהמתנה ({pending.length})</p>
        </button>
        {pendingOpen && <div className="flex flex-col gap-3 mb-6">
          {pending.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-3xl">📋</span>
              <p className="text-sm text-ink-3">עדיין לא הגשת מועמדות</p>
            </div>
          )}
          {pending.map((job) => (
            <div key={job.jobId} className="bg-paper rounded-2xl px-4 py-4 ring-1 ring-divider flex flex-col gap-3">
              {/* Top row */}
              <div className="flex items-start gap-3" style={{ direction: "ltr" }}>
                <div className="w-11 h-11 rounded-xl bg-cream-warm flex items-center justify-center font-serif text-base font-bold text-terracotta shrink-0">
                  {job.logo}
                </div>
                <div className="flex-1 text-right">
                  <p className="font-serif text-base font-bold text-ink tracking-tight leading-snug">{job.title}</p>
                  <p className="text-xs text-ink-3 mt-0.5">{job.company}</p>
                </div>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 justify-end">
                {job.salary && <Tag><DollarSign size={11} />{job.salary}</Tag>}
                {job.location && <Tag><MapPin size={11} />{job.location}</Tag>}
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-divider">
                <button onClick={() => router.push(`/jobs/${job.jobId}/view`)} className="flex items-center gap-1 text-xs text-ink-3 active:text-terracotta">
                  <Eye size={13} strokeWidth={1.8} />צפה במודעה
                </button>
                <div className="flex items-center gap-1.5">
                  {job.date && <p className="font-mono text-[10px] text-ink-3">נשלח ב-{job.date}</p>}
                  <span className="text-[11px] font-semibold text-terracotta bg-cream-warm rounded-full px-2.5 py-0.5">⏳ ממתין</span>
                </div>
              </div>
            </div>
          ))}
        </div>}

        {/* Approved */}
        <button onClick={() => setApprovedOpen((v) => !v)} className="flex flex-row-reverse items-center justify-between mb-3 w-full">
          <ChevronDown size={18} className={`text-ink-2 transition-transform ${approvedOpen ? "" : "-rotate-90"}`} strokeWidth={2} />
          <p className="text-base font-bold text-ink-2">משרות שאושרו ({approved.length})</p>
        </button>
        {approvedOpen && <div className="flex flex-col gap-3">
          {approved.map((job) => (
            <div key={job.jobId} className="bg-warm-success-bg rounded-2xl px-4 py-4 ring-1 ring-warm-success-border flex flex-col gap-3">
              {/* Top row */}
              <div className="flex items-start gap-3" style={{ direction: "ltr" }}>
                <div className="w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center font-serif text-base font-bold text-warm-success shrink-0">
                  {job.logo}
                </div>
                <div className="flex-1 text-right">
                  <p className="font-serif text-base font-bold text-ink tracking-tight leading-snug">{job.title}</p>
                  <p className="text-xs text-ink-2 mt-0.5">{job.company}</p>
                  <p className="text-xs text-warm-success font-bold mt-1">✓ המועמדות אושרה!</p>
                </div>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 justify-end">
                {job.salary && <Tag><DollarSign size={11} />{job.salary}</Tag>}
                {job.location && <Tag><MapPin size={11} />{job.location}</Tag>}
              </div>
              {/* Chat button */}
              <button
                onClick={() => job.conversationId ? router.push(`/messages/${job.conversationId}`) : router.push("/messages")}
                className="w-full h-11 bg-warm-success text-cream font-serif font-semibold text-sm rounded-xl flex items-center justify-center gap-2 active:opacity-90 transition-opacity"
              >
                <MessageSquare size={15} />פתיחת צ׳אט
              </button>
            </div>
          ))}
        </div>}

        {/* Rejected */}
        {rejected.length > 0 && (
          <>
            <button onClick={() => setRejectedOpen(v => !v)} className="flex flex-row-reverse items-center justify-between mb-3 w-full mt-2">
              <ChevronDown size={18} className={`text-ink-2 transition-transform ${rejectedOpen ? "" : "-rotate-90"}`} strokeWidth={2} />
              <p className="text-base font-bold text-ink-2">משרות שנדחו ({rejected.length})</p>
            </button>
            {rejectedOpen && <div className="flex flex-col gap-3">
              {rejected.map((job) => (
                <div key={job.jobId} className="bg-paper rounded-2xl px-4 py-4 shadow-sm ring-1 ring-warm-danger-border">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <p className="font-serif text-base font-bold text-ink text-right truncate flex-1 tracking-tight">{job.title}</p>
                    <div className="w-10 h-10 rounded-xl bg-cream-warm flex items-center justify-center font-serif text-sm font-bold text-ink shrink-0">{job.logo}</div>
                  </div>
                  <p className="text-sm text-ink-3 text-right mb-2">{job.company}</p>
                  <p className="text-xs text-warm-danger font-bold text-right">✗ המועמדות נדחתה</p>
                </div>
              ))}
            </div>}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
