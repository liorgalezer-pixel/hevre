"use client";

import { useState, useEffect, use } from "react";
import { ChevronLeft, MapPin, DollarSign, Clock, Heart, Share2, Eye, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Job = {
  id: string;
  title: string;
  salary: string;
  company_address: string;
  company_name: string;
  job_cities: string[];
  categories: string[];
  logo_url: string | null;
  description: string;
  requirements: string[];
  weekend: boolean;
  holidays: boolean;
  license: boolean;
  car: boolean;
  housing: boolean;
  start_time: string;
  end_time: string;
  q1?: string;
  q2?: string;
  q3?: string;
};

function CompanyAvatar({ name, size = 56 }: { name: string; size?: number }) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = (hash * 47) % 360;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 14,
        background: `oklch(0.94 0.04 ${hue})`,
        color: `oklch(0.45 0.13 ${hue})`,
      }}
      className="flex items-center justify-center font-serif font-bold shrink-0"
    >
      <span style={{ fontSize: size * 0.42 }}>{name[0]}</span>
    </div>
  );
}

export default function JobPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("jobs").select("*").eq("id", id).single();
      if (data) setJob(data as Job);
    })();
  }, [id]);

  if (!job) return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-cream" dir="rtl">
      <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const location = job.job_cities?.length ? job.job_cities.join(", ") : job.company_address;
  const hours = job.start_time && job.end_time ? `${job.start_time}-${job.end_time}` : "";
  const questions = [job.q1, job.q2, job.q3].filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      {/* Preview banner */}
      <div className="bg-terracotta px-4 py-2.5 flex items-center justify-center gap-2">
        <Eye size={14} className="text-cream opacity-80" strokeWidth={2} />
        <p className="text-cream text-xs font-semibold">תצוגה מקדימה — כך המשרה נראית למחפשי עבודה</p>
      </div>

      {/* Header */}
      <header className="bg-paper px-4 pt-10 pb-3 flex items-center justify-between border-b border-divider sticky top-0 z-10">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronLeft size={24} className="text-ink" strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-36 flex flex-col gap-5">

        {/* Top: avatar + title */}
        <div className="flex items-start gap-3" style={{ direction: "ltr" }}>
          <div className="flex items-center gap-2 shrink-0">
            <button className="w-9 h-9 flex items-center justify-center rounded-full">
              <Heart size={20} className="text-ink-3" strokeWidth={1.8} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full">
              <Share2 size={18} className="text-ink-3" strokeWidth={1.8} />
            </button>
          </div>
          <div className="flex-1 text-right">
            <h1 className="font-serif text-2xl font-bold text-ink leading-tight tracking-tight">{job.title}</h1>
            <p className="text-sm text-ink-2 mt-0.5">{job.company_name || job.company_address}</p>
          </div>
          <CompanyAvatar name={job.company_name || job.title} size={56} />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 justify-start" dir="rtl">
          {job.salary && (
            <span className="flex items-center gap-1.5 bg-warm-success-bg text-warm-success text-sm font-bold px-3 py-1.5 rounded-full ring-1 ring-warm-success-border">
              <DollarSign size={13} strokeWidth={2.5} />{job.salary}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1.5 bg-warm-info-bg text-warm-info-text text-sm font-semibold px-3 py-1.5 rounded-full">
              <MapPin size={13} strokeWidth={2} />{location}
            </span>
          )}
          {hours && (
            <span className="flex items-center gap-1.5 bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">
              <Clock size={13} strokeWidth={2} />{hours}
            </span>
          )}
          {job.car && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">🚗 כולל רכב</span>}
          {job.license && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">🪪 דרוש רישיון</span>}
          {job.housing && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">🏠 מספק דיור</span>}
          {job.weekend && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">📅 עבודה בסוף שבוע</span>}
          {job.holidays && <span className="bg-cream text-ink-2 text-sm font-medium px-3 py-1.5 rounded-full">✡️ עבודה בחגים</span>}
        </div>

        {/* Description */}
        {job.description && (
          <div>
            <h3 className="font-serif text-base font-semibold text-ink mb-2 tracking-tight">תיאור המשרה</h3>
            <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>
        )}

        {/* Requirements */}
        {job.requirements?.length > 0 && (
          <div>
            <h3 className="font-serif text-base font-semibold text-ink mb-2 tracking-tight">דרישות</h3>
            <ul className="flex flex-col gap-1.5">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
                  <span className="text-warm-success font-bold mt-0.5">✓</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Questions preview */}
        {questions.length > 0 && (
          <div>
            <h3 className="font-serif text-base font-semibold text-ink mb-3 tracking-tight">שאלות המעסיק</h3>
            <div className="flex flex-col gap-3">
              {questions.map((q, i) => (
                <div key={i}>
                  <label className="text-sm text-ink font-medium block mb-1">
                    <span className="font-mono text-[10px] text-terracotta font-bold ml-1.5">0{i + 1}</span>
                    {q}
                  </label>
                  <div className="w-full ring-1 ring-divider rounded-xl px-3 py-2 text-sm text-ink-3 bg-cream">
                    תשובתך...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Apply button (disabled in preview) */}
      <div className="fixed bottom-0 right-0 left-0 bg-paper border-t border-divider px-5 py-4 pb-8 flex flex-col gap-2">
        <p className="text-center text-xs text-terracotta font-semibold">תצוגה מקדימה — הכפתור אינו פעיל</p>
        <div className="w-full h-14 bg-ink/40 text-cream font-serif font-semibold text-base rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed">
          <CheckCircle2 size={20} className="text-cream/60" strokeWidth={2} />
          הגשת מועמדות מהירה
        </div>
      </div>
    </div>
  );
}
