"use client";

import { use, useState, useEffect } from "react";
import posthog from "posthog-js";
import { ChevronRight, MapPin, DollarSign, Clock, IdCard, Car, BedDouble, CalendarDays, Send, Heart, Share2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_JOBS } from "@/lib/mock-jobs";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
import { myApplicationsKey, STORAGE_KEYS } from "@/lib/storage-keys";

type Application = {
  jobId: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  date: string;
  logo: string;
  status?: "pending" | "approved";
};

export default function JobViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [aboutSelf, setAboutSelf] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [appStorageKey, setAppStorageKey] = useState<string>(STORAGE_KEYS.MY_APPLICATIONS);
  const [userJob, setUserJob] = useState<typeof MOCK_JOBS[0] | null>(null);
  const [jobLoaded, setJobLoaded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
    // Find user-posted job from Supabase
    const { data: found } = await supabase
      .from("jobs")
      .select("id, title, company_name, company_address, job_cities, job_states, salary, start_time, end_time, categories, car, license, housing, weekend, description, requirements, q1, q2, q3")
      .eq("id", id)
      .single();
    if (found) {
      setUserJob({
        id: found.id,
        title: found.title,
        company: found.company_name || found.company_address || "חברה",
        salary: found.salary || "",
        location: (found.job_cities?.length ? found.job_cities.join(", ") : found.company_address) || "",
        hours: found.start_time && found.end_time ? `${found.start_time}-${found.end_time}` : "",
        categories: found.categories || [],
        car: !!found.car,
        license: !!found.license,
        housing: !!found.housing,
        weekend: !!found.weekend,
        description: found.description || "",
        requirements: found.requirements || [],
        questions: [found.q1, found.q2, found.q3].filter(Boolean),
      });
    }
    setJobLoaded(true);

    const { data: sessionData } = await supabase.auth.getSession();
    setIsLoggedIn(!!sessionData.session);

    if (sessionData.session) {
      const userId = sessionData.session.user.id;

      // Record unique view
      await supabase.from("job_views").upsert({ job_id: id, viewer_id: userId }, { onConflict: "job_id,viewer_id" });

      const { data: myApp } = await supabase
        .from("applications")
        .select("status")
        .eq("job_id", id)
        .eq("applicant_id", userId)
        .single();
      if (myApp) {
        setAlreadyApplied(true);
        setIsApproved(myApp.status === "approved");
        setIsRejected(myApp.status === "rejected");
        if (myApp.status === "approved") {
          const { data: conv } = await supabase
            .from("conversations")
            .select("id")
            .eq("job_id", id)
            .eq("applicant_id", userId)
            .single();
          if (conv?.id) setConversationId(conv.id);
        }
      }
    }
    // Track job view
    if (job) posthog.capture("job_viewed", {
      job_id: id,
      category: job.categories?.[0] ?? null,
      neighborhood: job.location ?? null,
    });
    })();
  }, [id]);

  const job = MOCK_JOBS.find((j) => j.id === id) ?? userJob;

  if (!jobLoaded) return null;

  if (!job) return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4" dir="rtl">
      <p className="text-ink-2 text-base">המשרה לא נמצאה</p>
      <button onClick={() => router.push("/")} className="text-terracotta font-bold">חזרה לדף הבית</button>
    </div>
  );

  const initAnswers = () => {
    if (answers.length === 0) setAnswers(new Array(job.questions.length).fill(""));
  };

  const handleApply = () => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    posthog.capture("apply_clicked", { job_id: id, category: job?.categories?.[0] ?? null, source: "job_page" });
    initAnswers();
    setApplyOpen(true);
  };

  const allAnswered = answers.length === job?.questions.length && answers.every((a) => a.trim() !== "");

  const handleSubmit = async () => {
    if (!allAnswered || !job) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("applications").insert({
      job_id: id,
      applicant_id: user.id,
      answers: answers,
      about_self: aboutSelf,
    });
    if (!error) {
      posthog.capture("application_submitted", {
        job_id: id,
        category: job.categories?.[0] ?? null,
      });
      setApplyOpen(false);
      setSubmitted(true);
      setAlreadyApplied(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      {/* Header */}
      <header className="bg-paper px-4 pt-12 pb-3 flex items-center justify-between border-b border-divider sticky top-0 z-40">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-ink-2" strokeWidth={2} />
        </button>
        <span className="font-serif text-base font-bold text-ink tracking-tight">פרטי משרה</span>
        <div className="flex gap-1">
          <button onClick={() => setSaved((v) => !v)} className="w-11 h-11 flex items-center justify-center">
            <Heart size={22} className={saved ? "text-warm-danger fill-warm-danger" : "text-ink-3"} strokeWidth={1.8} />
          </button>
          <button
            onClick={async () => {
              const url = window.location.href;
              const title = userJob?.title ?? "משרה ב-Hevre";
              if (navigator.share) {
                await navigator.share({ title, url });
              } else {
                await navigator.clipboard.writeText(url);
                alert("הקישור הועתק!");
              }
            }}
            className="w-11 h-11 flex items-center justify-center"
          >
            <Share2 size={22} className="text-ink-3" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-44 flex flex-col gap-4">

        {/* Company card */}
        <div className="bg-paper px-4 pt-5 pb-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-cream-warm flex items-center justify-center shrink-0 font-serif text-2xl font-bold text-terracotta">
              {job.company[0]}
            </div>
            <div className="flex-1 text-right">
              <h1 className="font-serif text-xl font-bold text-ink leading-snug tracking-tight">{job.title}</h1>
              <p className="text-sm text-ink-2 mt-0.5">{job.company}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 justify-start">
            <span className="flex items-center gap-1 bg-warm-success-bg text-warm-success text-xs font-semibold px-3 py-1.5 rounded-full ring-1 ring-warm-success-border">
              <DollarSign size={11} strokeWidth={2.5} />{job.salary}
            </span>
            <span className="flex items-center gap-1 bg-cream-warm text-ink-2 text-xs font-medium px-3 py-1.5 rounded-full">
              <MapPin size={11} strokeWidth={2} />{job.location}
            </span>
            <span className="flex items-center gap-1 bg-cream-warm text-ink-2 text-xs font-medium px-3 py-1.5 rounded-full">
              <Clock size={11} strokeWidth={2} />{job.hours}
            </span>
            {job.car && <span className="bg-cream-warm text-ink-2 text-xs font-medium px-3 py-1.5 rounded-full ring-1 ring-divider">🚗 כולל רכב</span>}
            {job.housing && <span className="bg-cream-warm text-ink-2 text-xs font-medium px-3 py-1.5 rounded-full ring-1 ring-divider">🏠 כולל דיור</span>}
            {job.weekend && <span className="bg-cream-warm text-ink-2 text-xs font-medium px-3 py-1.5 rounded-full ring-1 ring-divider">📅 עבודה בסופ&quot;ש</span>}
          </div>
        </div>

        {/* Details */}
        <div className="bg-paper px-4 py-4 flex flex-col gap-3">
          <h2 className="font-serif text-base font-bold text-ink tracking-tight">תנאי המשרה</h2>
          {[
            { icon: MapPin, label: "מיקום", text: job.location },
            { icon: DollarSign, label: "שכר", text: job.salary },
            { icon: Clock, label: "שעות עבודה", text: job.hours },
            { icon: IdCard, label: "חובה רישיון", text: job.license ? "כן" : "לא" },
            { icon: Car, label: "מספק רכב", text: job.car ? "כן" : "לא" },
            { icon: BedDouble, label: "מספק דיור", text: job.housing ? "כן" : "לא" },
            { icon: CalendarDays, label: "עבודה בסופ\"ש", text: job.weekend ? "כן" : "לא" },
          ].map(({ icon: Icon, label, text }, i) => (
            <div key={i} className="flex items-center gap-2" style={{ direction: "ltr" }}>
              <span className="text-sm text-ink-2 flex-1 text-left">{text}</span>
              <span className="text-sm text-ink-3">|</span>
              <span className="text-sm text-ink-2 font-medium">{label}</span>
              <Icon size={17} className="text-ink-3 shrink-0" strokeWidth={1.6} />
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="bg-paper px-4 py-4 flex flex-col gap-2">
          <h2 className="font-serif text-base font-bold text-ink tracking-tight">תיאור המשרה</h2>
          <p className="text-sm text-ink-2 leading-relaxed">{job.description}</p>
        </div>

        {/* Requirements */}
        <div className="bg-paper px-4 py-4 flex flex-col gap-2">
          <h2 className="font-serif text-base font-bold text-ink tracking-tight">דרישות התפקיד</h2>
          <ul className="flex flex-col gap-2">
            {job.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-terracotta font-bold mt-0.5 shrink-0">✓</span>
                <span className="text-sm text-ink-2">{req}</span>
              </li>
            ))}
          </ul>
        </div>

      </main>

      {/* Apply button */}
      <div className="fixed bottom-16 right-0 left-0 bg-paper border-t border-divider px-4 py-3">
        {isApproved ? (
          <button
            onClick={() => conversationId ? router.push(`/messages/${conversationId}`) : router.push("/messages")}
            className="w-full h-14 bg-warm-success text-cream font-serif font-semibold text-base rounded-2xl flex items-center justify-center gap-2 active:opacity-80"
          >
            ✓ מועמדות אושרה — פתח צ׳אט
          </button>
        ) : isRejected ? (
          <div className="w-full h-14 bg-warm-danger-bg ring-1 ring-warm-danger-border text-warm-danger font-serif font-semibold text-base rounded-2xl flex items-center justify-center gap-2">
            ✗ מועמדות נדחתה
          </div>
        ) : alreadyApplied || submitted ? (
          <div className="w-full h-14 bg-orange-50 border border-orange-200 text-orange-500 font-serif font-semibold text-base rounded-2xl flex items-center justify-center gap-2">
            ⏳ מועמדות בהמתנה
          </div>
        ) : (
          <button
            onClick={handleApply}
            className="w-full h-14 bg-ink text-cream font-serif font-semibold text-lg rounded-2xl active:bg-terracotta-deep transition-colors flex items-center justify-center gap-2"
          >
            <Send size={20} strokeWidth={2} />
            הגשת מועמדות
          </button>
        )}
      </div>

      <BottomNav />

      {/* Auth required modal */}
      {authModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setAuthModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="bg-paper rounded-t-3xl w-full px-6 pt-6 pb-10 flex flex-col items-center gap-5">
              <div className="w-10 h-1 bg-cream-warm rounded-full mb-1" />
              <div className="w-16 h-16 rounded-full bg-cream-warm flex items-center justify-center">
                <LogIn size={30} className="text-terracotta" strokeWidth={1.8} />
              </div>
              <div className="text-center flex flex-col gap-1">
                <h2 className="font-serif text-xl font-bold text-ink tracking-tight">כדי להגיש מועמדות</h2>
                <p className="text-sm text-ink-2 leading-relaxed">יש להתחבר או להירשם לאפליקציה תחילה</p>
              </div>
              <button
                onClick={() => { setAuthModalOpen(false); router.push("/login"); }}
                className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl active:bg-terracotta-deep"
              >
                התחברות
              </button>
              <button
                onClick={() => { setAuthModalOpen(false); router.push("/register"); }}
                className="w-full h-14 ring-2 ring-ink text-ink font-serif font-semibold text-base rounded-2xl active:bg-cream"
              >
                הרשמה חינמית
              </button>
              <button onClick={() => setAuthModalOpen(false)} className="font-mono text-[11px] text-ink-3 uppercase tracking-wider mt-1">
                אולי אחר כך
              </button>
            </div>
          </div>
        </>
      )}

      {/* Apply bottom sheet */}
      {applyOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setApplyOpen(false)} />
          <div className="fixed bottom-0 right-0 left-0 z-50 bg-paper rounded-t-3xl px-4 pt-5 pb-10 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-cream-warm rounded-full mx-auto mb-1" />
            <h2 className="font-serif text-lg font-bold text-ink text-center tracking-tight">הגשת מועמדות</h2>
            <p className="text-sm text-ink-2 text-center">אנא ענה על השאלות הבאות</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink-2">משהו שתרצה להוסיף על עצמך? <span className="text-ink-3 font-normal">(אופציונלי)</span></label>
              <textarea
                value={aboutSelf}
                placeholder="ספר קצת על עצמך, ניסיון רלוונטי, או כל דבר שיעזור למעסיק להכיר אותך..."
                rows={3}
                onChange={(e) => setAboutSelf(e.target.value)}
                dir="rtl"
                className="w-full bg-cream ring-1 ring-divider rounded-xl px-3 py-2.5 text-sm text-right outline-none resize-none focus:ring-terracotta"
              />
            </div>

            {job.questions.map((q, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink-2">{q}</label>
                <textarea
                  value={answers[i] || ""}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  placeholder="תשובתך כאן..."
                  rows={2}
                  className="w-full bg-cream ring-1 ring-divider rounded-xl px-3 py-2.5 text-sm text-right outline-none resize-none focus:ring-terracotta"
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl active:bg-terracotta-deep mt-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              שלח מועמדות
            </button>
          </div>
        </>
      )}
    </div>
  );
}
