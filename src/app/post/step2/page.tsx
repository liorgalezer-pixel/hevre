"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";
import { ChevronRight, Check, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const STORAGE_KEY = STORAGE_KEYS.POST_STEP_1;

export default function PostJobStep2Page() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.jobTitle) setJobTitle(d.jobTitle);
        if (d.description) setDescription(d.description);
        if (d.requirements) setRequirements(d.requirements);
      } catch {}
    }
    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    const existing = saved ? JSON.parse(saved) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, jobTitle, description, requirements }));
  }, [jobTitle, description, requirements, dataLoaded]);

  const addRequirement = () => setRequirements(prev => [...prev, ""]);
  const updateRequirement = (i: number, val: string) =>
    setRequirements(prev => prev.map((r, idx) => (idx === i ? val : r)));
  const removeRequirement = (i: number) =>
    setRequirements(prev => prev.filter((_, idx) => idx !== i));

  const canContinue = jobTitle.trim().length > 0 && description.trim().length > 0;

  const handleContinue = () => {
    posthog.capture("post_job_step", { step: 2, step_name: "job_details" });
    router.push("/post/step3");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      <header className="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
            <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">פרסום משרה</h1>
          <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shrink-0 ${
                s < 2 ? "bg-blue-700 text-white" : s === 2 ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-400"
              }`}>
                {s < 2 ? <Check size={14} strokeWidth={3} /> : s}
              </div>
              {s < 4 && <div className={`h-1 flex-1 rounded-full ${s < 2 ? "bg-blue-700" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 pt-6 pb-32 flex flex-col gap-5">

        <div className="text-right">
          <p className="text-sm text-gray-400 font-medium mb-0.5">המשך פרסום משרה</p>
          <h2 className="text-2xl font-black text-blue-900">פרטי המשרה</h2>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-gray-900 text-right">כותרת המשרה <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="לדוגמא: מנהל מכירות, נהג משאית..."
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            dir="rtl"
            className="w-full h-13 rounded-xl border border-gray-200 bg-white px-4 text-right text-base outline-none focus:border-blue-500 placeholder:text-gray-300"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-gray-900 text-right">תיאור המשרה <span className="text-red-500">*</span></label>
          <textarea
            placeholder="תאר את המשרה..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            dir="rtl"
            rows={5}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-base outline-none focus:border-blue-500 placeholder:text-gray-300 resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-gray-900 text-right">דרישות תפקיד</label>
          <div className="flex flex-col gap-2">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2" style={{ direction: "rtl" }}>
                <span className="text-green-500 shrink-0 text-lg">✓</span>
                <input
                  type="text"
                  value={req}
                  placeholder="הוסף דרישה..."
                  onChange={(e) => updateRequirement(i, e.target.value)}
                  dir="rtl"
                  className="flex-1 h-11 rounded-xl border border-gray-200 bg-white px-3 text-right text-sm outline-none focus:border-blue-500 placeholder:text-gray-300"
                />
                {requirements.length > 1 && (
                  <button onClick={() => removeRequirement(i)} className="w-8 h-8 flex items-center justify-center text-gray-300 active:text-red-400 shrink-0">
                    <X size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addRequirement}
            disabled={requirements.length >= 6 || requirements[requirements.length - 1].trim() === ""}
            className="self-start flex items-center gap-1.5 text-sm font-bold mt-1 disabled:opacity-30 text-blue-700 active:opacity-70"
          >
            <span className="text-lg leading-none">+</span> הוסף דרישה
          </button>
        </div>

      </main>

      <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full h-14 bg-blue-700 text-white font-bold text-lg rounded-2xl active:bg-blue-800 transition-colors disabled:opacity-40"
        >
          המשך
        </button>
      </div>
    </div>
  );
}
