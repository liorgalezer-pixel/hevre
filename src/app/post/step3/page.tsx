"use client";

import { useState, useRef, useEffect } from "react";
import posthog from "posthog-js";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { ChevronRight, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = STORAGE_KEYS.POST_STEP_2;

const TIMES: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIMES.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-base font-semibold min-w-[90px] justify-center ring-1 ${
          value ? "bg-cream-warm ring-divider text-ink" : "bg-paper ring-divider text-ink-3"
        }`}
      >
        {value || "--:--"}
        <ChevronDown size={14} className="text-ink-3" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-paper rounded-xl shadow-lg ring-1 ring-divider w-28 max-h-52 overflow-y-auto">
          {TIMES.map((t) => (
            <button
              key={t}
              onClick={() => { onChange(t); setOpen(false); }}
              className={`w-full text-center py-2.5 text-sm font-medium transition-colors ${t === value ? "bg-cream-warm text-terracotta font-bold" : "text-ink-2 hover:bg-cream"}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${value ? "bg-terracotta" : "bg-cream-warm"}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-paper shadow transition-transform ${value ? "translate-x-1" : "translate-x-6"}`} />
    </button>
  );
}

export default function PostJobStep3Page() {
  const router = useRouter();
  const [salary, setSalary] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [weekend, setWeekend] = useState(false);
  const [holidays, setHolidays] = useState(false);
  const [license, setLicense] = useState(false);
  const [car, setCar] = useState(false);
  const [housing, setHousing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const d = JSON.parse(saved);
      if (d.salary !== undefined) setSalary(d.salary);
      if (d.startTime) setStartTime(d.startTime);
      if (d.endTime) setEndTime(d.endTime);
      if (d.weekend !== undefined) setWeekend(d.weekend);
      if (d.holidays !== undefined) setHolidays(d.holidays);
      if (d.license !== undefined) setLicense(d.license);
      if (d.car !== undefined) setCar(d.car);
      if (d.housing !== undefined) setHousing(d.housing);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      salary, startTime, endTime, weekend, holidays, license, car, housing,
    }));
  }, [salary, startTime, endTime, weekend, holidays, license, car, housing]);

  const canContinue = salary.trim().length > 0 && startTime.length > 0 && endTime.length > 0;

  const handleContinue = () => {
    posthog.capture("post_job_step", { step: 3, step_name: "conditions" });
    router.push("/post/step4");
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      <header className="bg-paper px-4 pt-12 pb-4 border-b border-divider">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
            <ChevronRight size={24} className="text-ink-2" strokeWidth={2} />
          </button>
          <h1 className="font-serif text-lg font-bold text-ink tracking-tight">פרסום משרה</h1>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shrink-0 ${
                s < 3 ? "bg-terracotta text-cream" : s === 3 ? "bg-terracotta text-cream" : "bg-cream-warm text-ink-3"
              }`}>
                {s < 3 ? <Check size={14} strokeWidth={3} /> : s}
              </div>
              {s < 4 && <div className={`h-1 flex-1 rounded-full ${s < 3 ? "bg-terracotta" : "bg-cream-warm"}`} />}
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 pt-6 pb-32 flex flex-col gap-6">

        <div className="text-right">
          <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider mb-0.5">המשך פרסום משרה</p>
          <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">תנאי משרה</h1>
        </div>

        {/* Salary */}
        <div className="flex items-center gap-3" style={{ direction: "ltr" }}>
          <input
            type="text"
            placeholder="למשל 2000-4000"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            dir="rtl"
            className="flex-1 h-13 rounded-xl bg-cream-warm ring-1 ring-divider px-4 text-right text-base outline-none focus:ring-terracotta placeholder:text-ink-2 font-medium"
          />
          <label className="text-base font-medium text-ink-2 shrink-0 whitespace-nowrap">שכר שבועי ממוצע <span className="text-warm-danger">*</span></label>
        </div>

        {/* Work hours */}
        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-base font-bold text-ink text-right tracking-tight">שעות עבודה <span className="text-warm-danger">*</span></h2>
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">סיום</span>
              <TimePicker value={endTime} onChange={setEndTime} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">התחלה</span>
              <TimePicker value={startTime} onChange={setStartTime} />
            </div>
          </div>
          <p className="text-xs text-ink-3 text-right">(אופציה לבחור בקפיצות של חצי שעה)</p>
        </div>

        {/* Toggles */}
        <div className="bg-paper rounded-2xl shadow-sm overflow-hidden">
          {[
            { label: "עבודה בסוף שבוע", value: weekend, set: setWeekend },
            { label: "עבודה בחגים", value: holidays, set: setHolidays },
          ].map(({ label, value, set }, idx, arr) => (
            <div
              key={label}
              className={`flex items-center justify-between px-4 py-4 ${idx < arr.length - 1 ? "border-b border-divider" : ""}`}
              style={{ direction: "ltr" }}
            >
              <Toggle value={value} onChange={set} />
              <span className="text-base text-ink">{label}</span>
            </div>
          ))}
        </div>

        {/* Additional conditions */}
        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-base font-bold text-ink text-right tracking-tight">תנאים נוספים</h2>
          <div className="bg-paper rounded-2xl shadow-sm overflow-hidden">
            {[
              { label: "חייב רישיון נהיגה", value: license, set: setLicense },
              { label: "מספק רכב", value: car, set: setCar },
              { label: "מספק דיור", value: housing, set: setHousing },
            ].map(({ label, value, set }, idx, arr) => (
              <div
                key={label}
                className={`flex items-center justify-between px-4 py-4 ${idx < arr.length - 1 ? "border-b border-divider" : ""}`}
                style={{ direction: "ltr" }}
              >
                <Toggle value={value} onChange={set} />
                <span className="text-base text-ink">{label}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      <div className="fixed bottom-0 right-0 left-0 bg-paper border-t border-divider px-4 py-4">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full h-14 bg-ink text-cream font-serif font-semibold text-lg rounded-2xl active:bg-terracotta-deep transition-colors disabled:opacity-40"
        >
          המשך
        </button>
      </div>
    </div>
  );
}
