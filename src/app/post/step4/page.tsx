"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";
import { ChevronLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS, myJobsKey } from "@/lib/storage-keys";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = STORAGE_KEYS.POST_STEP_3;

export default function PostJobStep4Page() {
  const router = useRouter();
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const d = JSON.parse(saved);
      if (d.q1 !== undefined) setQ1(d.q1);
      if (d.q2 !== undefined) setQ2(d.q2);
      if (d.q3 !== undefined) setQ3(d.q3);
    } catch {}
  }, []);

  const handlePublish = async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ q1, q2, q3 }));
    const { data: { user } } = await supabase.auth.getUser();

    const step1 = JSON.parse(localStorage.getItem(STORAGE_KEYS.POST_STEP_1) || "{}");
    const step2 = JSON.parse(localStorage.getItem(STORAGE_KEYS.POST_STEP_2) || "{}");
    const newJob = {
      title: step1.jobTitle || "משרה חדשה",
      companyName: step1.companyName || "",
      description: step1.description || "",
      categories: step1.selectedCategories || [],
      otherText: step1.otherText || "",
      logoPreview: step1.logoPreview || null,
      companyAddress: step1.selectedCities?.[0] || step1.selectedStates?.[0] || "",
      jobStates: step1.selectedStates || [],
      jobCities: step1.selectedCities || [],
      salary: step2.salary || "",
      startTime: step2.onDuty ? "כוננות" : (step2.startTime || ""),
      endTime: step2.onDuty ? "כוננות" : (step2.endTime || ""),
      onDuty: step2.onDuty || false,
      weekend: step2.weekend || false,
      holidays: step2.holidays || false,
      license: step2.license || false,
      car: step2.car || false,
      housing: step2.housing || false,
      q1, q2, q3,
    };

    const { error } = await supabase.from("jobs").insert({
      id: crypto.randomUUID(),
      created_by: user?.id,
      title: newJob.title,
      company_name: newJob.companyName,
      company_address: newJob.companyAddress,
      job_states: newJob.jobStates,
      job_cities: newJob.jobCities,
      salary: newJob.salary,
      start_time: newJob.startTime,
      end_time: newJob.endTime,
      categories: newJob.categories,
      description: newJob.description,
      requirements: step1.requirements || [],
      logo_url: newJob.logoPreview,
      car: newJob.car,
      license: newJob.license,
      housing: newJob.housing,
      weekend: newJob.weekend,
      holidays: newJob.holidays,
      q1: newJob.q1,
      q2: newJob.q2,
      q3: newJob.q3,
    });

    if (error) { alert("שגיאה בשמירת המשרה: " + error.message); return; }
    posthog.capture("job_posted", { job_title: newJob.title, company: newJob.companyName, categories: newJob.categories });
    localStorage.removeItem(STORAGE_KEYS.POST_STEP_1);
    localStorage.removeItem(STORAGE_KEYS.POST_STEP_2);
    localStorage.removeItem(STORAGE_KEYS.POST_STEP_3);
    setSuccess(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      <header className="bg-paper px-4 pt-12 pb-4 border-b border-divider">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
          </div>
          <h1 className="font-serif text-lg font-bold text-ink tracking-tight">פרסום משרה</h1>
          <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
            <ChevronLeft size={24} className="text-ink-2" strokeWidth={2} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shrink-0 ${
                s < 4 ? "bg-terracotta text-cream" : s === 4 ? "bg-terracotta text-cream" : "bg-cream-warm text-ink-3"
              }`}>
                {s < 4 ? <Check size={14} strokeWidth={3} /> : s}
              </div>
              {s < 4 && <div className={`h-1 flex-1 rounded-full ${s < 4 ? "bg-terracotta" : "bg-cream-warm"}`} />}
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 pt-6 pb-32 flex flex-col gap-6">

        <div className="text-right">
          <h2 className="font-serif text-2xl font-bold text-ink tracking-tight">שאלות לסינון</h2>
          <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider mt-1">שאלות שהמועמד חייב לענות עליהם</p>
        </div>

        {[
          { label: "שאלה 1", value: q1, set: setQ1 },
          { label: "שאלה 2", value: q2, set: setQ2 },
          { label: "שאלה 3", value: q3, set: setQ3 },
        ].map(({ label, value, set }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between" style={{ direction: "ltr" }}>
              <span className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">אופציונלי</span>
              <span className="text-base font-bold text-ink">{label}</span>
            </div>
            <textarea
              placeholder="כתוב את השאלה כאן..."
              value={value}
              onChange={(e) => set(e.target.value)}
              dir="rtl"
              rows={4}
              className="w-full rounded-xl bg-cream ring-1 ring-divider px-4 py-3 text-right text-base outline-none focus:ring-terracotta placeholder:text-ink-3 resize-none"
            />
          </div>
        ))}

      </main>

      {success && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-paper rounded-3xl w-full px-6 py-10 flex flex-col items-center gap-5 shadow-xl">
              <div className="text-5xl">🎉</div>
              <h2 className="font-serif text-xl font-bold text-ink text-center tracking-tight">פרסום בוצע בהצלחה!</h2>
              <p className="text-sm text-ink-3 text-center">המשרה שלך פורסמה ומועמדים יוכלו לראות אותה</p>
              <button
                onClick={() => router.push("/")}
                className="w-full h-13 bg-ink text-cream font-serif font-semibold text-base rounded-2xl active:bg-terracotta-deep transition-colors"
              >
                חזרה לדף הבית
              </button>
            </div>
          </div>
        </>
      )}

      <div className="fixed bottom-0 right-0 left-0 bg-paper border-t border-divider px-4 py-4">
        <button
          onClick={handlePublish}
          className="w-full h-14 bg-ink text-cream font-serif font-semibold text-lg rounded-2xl active:bg-terracotta-deep transition-colors"
        >
          פרסם משרה
        </button>
      </div>
    </div>
  );
}
