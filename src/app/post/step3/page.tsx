"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const STORAGE_KEY = STORAGE_KEYS.POST_STEP_3;

export default function PostJobStep3Page() {
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

  const handlePublish = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ q1, q2, q3 }));

    // Merge all steps into one job entry and save to jobs list
    const step1 = JSON.parse(localStorage.getItem(STORAGE_KEYS.POST_STEP_1) || "{}");
    const step2 = JSON.parse(localStorage.getItem(STORAGE_KEYS.POST_STEP_2) || "{}");
    const newJob = {
      id: Date.now().toString(),
      title: step1.jobTitle || step1.companyName || "משרה חדשה",
      description: step1.description || "",
      categories: step1.selectedCategories || [],
      otherText: step1.otherText || "",
      logoPreview: step1.logoPreview || null,
      companyAddress: step1.companyAddress || "",
      salary: step2.salary || "",
      startTime: step2.startTime || "",
      endTime: step2.endTime || "",
      weekend: step2.weekend || false,
      holidays: step2.holidays || false,
      license: step2.license || false,
      car: step2.car || false,
      housing: step2.housing || false,
      q1, q2, q3,
      active: true,
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.MY_JOBS) || "[]");
    localStorage.setItem(STORAGE_KEYS.MY_JOBS, JSON.stringify([newJob, ...existing]));
    posthog.capture("job_posted", { job_title: newJob.title, company: newJob.companyName, categories: newJob.categories });

    setSuccess(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">המשך פרסום משרה</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>

      <main className="flex-1 px-4 pt-6 pb-32 flex flex-col gap-6">

        {/* Title */}
        <div className="text-right">
          <h2 className="text-2xl font-black text-blue-900">שאלות לסינון</h2>
          <p className="text-sm text-gray-400 mt-1">שאלות שהמועמד חייב לענות עליהם</p>
        </div>

        {/* Questions */}
        {[
          { label: "שאלה 1", value: q1, set: setQ1 },
          { label: "שאלה 2", value: q2, set: setQ2 },
          { label: "שאלה 3", value: q3, set: setQ3 },
        ].map(({ label, value, set }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">אופציונלי</span>
              <span className="text-base font-bold text-gray-900">{label}</span>
            </div>
            <textarea
              placeholder="כתוב את השאלה כאן..."
              value={value}
              onChange={(e) => set(e.target.value)}
              dir="rtl"
              rows={4}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-base outline-none focus:border-blue-500 placeholder:text-gray-300 resize-none"
            />
          </div>
        ))}

      </main>

      {/* Success modal */}
      {success && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-3xl w-full px-6 py-10 flex flex-col items-center gap-5 shadow-xl">
              <div className="text-5xl">🎉</div>
              <h2 className="text-xl font-black text-gray-900 text-center">פרסום בוצע בהצלחה!</h2>
              <p className="text-sm text-gray-400 text-center">המשרה שלך פורסמה ומועמדים יוכלו לראות אותה</p>
              <button
                onClick={() => router.push("/")}
                className="w-full h-13 bg-blue-700 text-white font-bold text-base rounded-2xl active:bg-blue-800 transition-colors"
              >
                חזרה לדף הבית
              </button>
            </div>
          </div>
        </>
      )}

      {/* Publish button */}
      <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handlePublish}
          className="w-full h-14 bg-blue-700 text-white font-bold text-lg rounded-2xl active:bg-blue-800 transition-colors"
        >
          פרסם משרה
        </button>
      </div>
    </div>
  );
}
