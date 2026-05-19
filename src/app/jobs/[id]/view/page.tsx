"use client";

import { use, useState, useEffect } from "react";
import posthog from "posthog-js";
import { ChevronRight, MapPin, DollarSign, Clock, IdCard, Car, BedDouble, CalendarDays, Send, Heart, Share2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_JOBS } from "@/lib/mock-jobs";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
import { STORAGE_KEYS } from "@/lib/storage-keys";

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
    const apps: Application[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MY_APPLICATIONS) || "[]");
    const myApp = apps.find((a) => a.jobId === id);
    if (myApp) {
      setAlreadyApplied(true);
      setIsApproved(myApp.status === "approved");
    }
    // Track job view
    if (job) posthog.capture("job_viewed", { job_id: id, job_title: job.title, company: job.company });
  }, [id]);

  const job = MOCK_JOBS.find((j) => j.id === id);

  if (!job) return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4" dir="rtl">
      <p className="text-gray-500 text-base">המשרה לא נמצאה</p>
      <button onClick={() => router.push("/")} className="text-blue-700 font-bold">חזרה לדף הבית</button>
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
    initAnswers();
    setApplyOpen(true);
  };

  const allAnswered = answers.length === job?.questions.length && answers.every((a) => a.trim() !== "");

  const handleSubmit = () => {
    if (!allAnswered || !job) return;
    const apps: Application[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MY_APPLICATIONS) || "[]");
    if (!apps.some((a) => a.jobId === id)) {
      apps.push({
        jobId: id,
        title: job.title,
        company: job.company,
        salary: job.salary,
        location: job.location,
        date: new Date().toLocaleDateString("he-IL"),
        logo: job.company[0],
      });
      localStorage.setItem(STORAGE_KEYS.MY_APPLICATIONS, JSON.stringify(apps));
      posthog.capture("job_applied", { job_id: id, job_title: job.title, company: job.company });
    }
    setApplyOpen(false);
    setSubmitted(true);
    setAlreadyApplied(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <span className="text-base font-bold text-gray-900">פרטי משרה</span>
        <div className="flex gap-1">
          <button onClick={() => setSaved((v) => !v)} className="w-11 h-11 flex items-center justify-center">
            <Heart size={22} className={saved ? "text-red-500 fill-red-500" : "text-gray-400"} strokeWidth={1.8} />
          </button>
          <button className="w-11 h-11 flex items-center justify-center">
            <Share2 size={22} className="text-gray-400" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-44 flex flex-col gap-4">

        {/* Company card */}
        <div className="bg-white px-4 pt-5 pb-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 text-2xl font-black text-blue-700">
              {job.company[0]}
            </div>
            <div className="flex-1 text-right">
              <h1 className="text-xl font-black text-gray-900 leading-snug">{job.title}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 justify-start">
            <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
              <DollarSign size={11} strokeWidth={2.5} />{job.salary}
            </span>
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
              <MapPin size={11} strokeWidth={2} />{job.location}
            </span>
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
              <Clock size={11} strokeWidth={2} />{job.hours}
            </span>
            {job.car && <span className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100">🚗 כולל רכב</span>}
            {job.housing && <span className="bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full border border-purple-100">🏠 כולל דיור</span>}
            {job.weekend && <span className="bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1.5 rounded-full border border-orange-100">📅 עבודה בסופ&quot;ש</span>}
          </div>
        </div>

        {/* Details */}
        <div className="bg-white px-4 py-4 flex flex-col gap-3">
          <h2 className="text-base font-bold text-gray-900">תנאי המשרה</h2>
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
              <span className="text-sm text-gray-600 flex-1 text-left">{text}</span>
              <span className="text-sm text-gray-300">|</span>
              <span className="text-sm text-gray-700 font-medium">{label}</span>
              <Icon size={17} className="text-gray-400 shrink-0" strokeWidth={1.6} />
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="bg-white px-4 py-4 flex flex-col gap-2">
          <h2 className="text-base font-bold text-gray-900">תיאור המשרה</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
        </div>

        {/* Requirements */}
        <div className="bg-white px-4 py-4 flex flex-col gap-2">
          <h2 className="text-base font-bold text-gray-900">דרישות התפקיד</h2>
          <ul className="flex flex-col gap-2">
            {job.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-700 font-bold mt-0.5 shrink-0">✓</span>
                <span className="text-sm text-gray-600">{req}</span>
              </li>
            ))}
          </ul>
        </div>

      </main>

      {/* Apply button */}
      <div className="fixed bottom-16 right-0 left-0 bg-white border-t border-gray-100 px-4 py-3">
        {isApproved ? (
          <div className="w-full h-14 bg-green-50 border border-green-200 text-green-600 font-black text-base rounded-2xl flex items-center justify-center gap-2">
            ✓ מועמדות אושרה!
          </div>
        ) : alreadyApplied || submitted ? (
          <div className="w-full h-14 bg-orange-50 border border-orange-200 text-orange-500 font-black text-base rounded-2xl flex items-center justify-center gap-2">
            ⏳ מועמדות בהמתנה
          </div>
        ) : (
          <button
            onClick={handleApply}
            className="w-full h-14 bg-blue-700 text-white font-black text-lg rounded-2xl active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
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
            <div className="bg-white rounded-t-3xl w-full px-6 pt-6 pb-10 flex flex-col items-center gap-5">
              <div className="w-10 h-1 bg-gray-200 rounded-full mb-1" />
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <LogIn size={30} className="text-blue-700" strokeWidth={1.8} />
              </div>
              <div className="text-center flex flex-col gap-1">
                <h2 className="text-xl font-black text-gray-900">כדי להגיש מועמדות</h2>
                <p className="text-sm text-gray-500 leading-relaxed">יש להתחבר או להירשם לאפליקציה תחילה</p>
              </div>
              <button
                onClick={() => { setAuthModalOpen(false); router.push("/login"); }}
                className="w-full h-14 bg-blue-700 text-white font-black text-base rounded-2xl active:bg-blue-800"
              >
                התחברות
              </button>
              <button
                onClick={() => { setAuthModalOpen(false); router.push("/register"); }}
                className="w-full h-14 border-2 border-blue-700 text-blue-700 font-black text-base rounded-2xl active:bg-blue-50"
              >
                הרשמה חינמית
              </button>
              <button onClick={() => setAuthModalOpen(false)} className="text-sm text-gray-400 mt-1">
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
          <div className="fixed bottom-0 right-0 left-0 z-50 bg-white rounded-t-3xl px-4 pt-5 pb-10 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1" />
            <h2 className="text-lg font-black text-gray-900 text-center">הגשת מועמדות</h2>
            <p className="text-sm text-gray-500 text-center">אנא ענה על השאלות הבאות</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">משהו שתרצה להוסיף על עצמך? <span className="text-gray-400 font-normal">(אופציונלי)</span></label>
              <textarea
                value={aboutSelf}
                placeholder="ספר קצת על עצמך, ניסיון רלוונטי, או כל דבר שיעזור למעסיק להכיר אותך..."
                rows={3}
                onChange={(e) => setAboutSelf(e.target.value)}
                dir="rtl"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-right outline-none resize-none focus:border-blue-400"
              />
            </div>

            {job.questions.map((q, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">{q}</label>
                <textarea
                  value={answers[i] || ""}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  placeholder="תשובתך כאן..."
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-right outline-none resize-none focus:border-blue-400"
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="w-full h-14 bg-blue-700 text-white font-black text-base rounded-2xl active:bg-blue-800 mt-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              שלח מועמדות
            </button>
          </div>
        </>
      )}
    </div>
  );
}
