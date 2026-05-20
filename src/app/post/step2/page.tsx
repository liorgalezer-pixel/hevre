"use client";

import { useState, useRef, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const STORAGE_KEY = STORAGE_KEYS.POST_STEP_2;
import { ChevronRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
        className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-base font-semibold text-gray-800 min-w-[90px] justify-center"
      >
        {value}
        <ChevronDown size={14} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-white rounded-xl shadow-lg border border-gray-100 w-28 max-h-52 overflow-y-auto">
          {TIMES.map((t) => (
            <button
              key={t}
              onClick={() => { onChange(t); setOpen(false); }}
              className={`w-full text-center py-2.5 text-sm font-medium hover:bg-blue-50 transition-colors ${t === value ? "bg-blue-100 text-blue-700 font-bold" : "text-gray-700"}`}
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
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${value ? "bg-blue-600" : "bg-gray-300"}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-1" : "translate-x-6"}`} />
    </button>
  );
}

export default function PostJobStep2Page() {
  const router = useRouter();
  const [salary, setSalary] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
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

  const handleContinueStep3 = () => {
    router.push("/post/step3");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
        <div className="w-11" />
      </header>

      <main className="flex-1 px-4 pt-6 pb-32 flex flex-col gap-6">

        {/* Page title */}
        <div className="text-right">
          <p className="text-sm text-gray-400 font-medium mb-0.5">המשך פרסום משרה</p>
          <h1 className="text-2xl font-black text-blue-900">תנאי משרה</h1>
        </div>

        {/* Salary */}
        <div className="flex items-center gap-3" style={{ direction: "ltr" }}>
          <input
            type="text"
            placeholder="למשל 2000-4000"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            dir="rtl"
            className="flex-1 h-13 rounded-xl border border-blue-100 bg-blue-50 px-4 text-right text-base outline-none focus:border-blue-400 placeholder:text-gray-500 font-medium"
          />
          <label className="text-base font-medium text-gray-700 shrink-0 whitespace-nowrap">שכר שבועי ממוצע</label>
        </div>

        {/* Work hours */}
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-black text-gray-900 text-right">שעות עבודה</h2>
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">סיום</span>
              <TimePicker value={endTime} onChange={setEndTime} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">התחלה</span>
              <TimePicker value={startTime} onChange={setStartTime} />
            </div>
          </div>
          <p className="text-xs text-gray-400 text-right">(אופציה לבחור בקפיצות של חצי שעה)</p>
        </div>

        {/* Toggles - work conditions */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {[
            { label: "עבודה בסוף שבוע", value: weekend, set: setWeekend },
            { label: "עבודה בחגים", value: holidays, set: setHolidays },
          ].map(({ label, value, set }, idx, arr) => (
            <div
              key={label}
              className={`flex items-center justify-between px-4 py-4 ${idx < arr.length - 1 ? "border-b border-gray-100" : ""}`}
              style={{ direction: "ltr" }}
            >
              <Toggle value={value} onChange={set} />
              <span className="text-base text-gray-800">{label}</span>
            </div>
          ))}
        </div>

        {/* Additional conditions */}
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-black text-gray-900 text-right">תנאים נוספים</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {[
              { label: "חייב רישיון נהיגה", value: license, set: setLicense },
              { label: "מספק רכב", value: car, set: setCar },
              { label: "מספק דיור", value: housing, set: setHousing },
            ].map(({ label, value, set }, idx, arr) => (
              <div
                key={label}
                className={`flex items-center justify-between px-4 py-4 ${idx < arr.length - 1 ? "border-b border-gray-100" : ""}`}
                style={{ direction: "ltr" }}
              >
                <Toggle value={value} onChange={set} />
                <span className="text-base text-gray-800">{label}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Continue button */}
      <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleContinueStep3}
          className="w-full h-14 bg-blue-700 text-white font-bold text-lg rounded-2xl active:bg-blue-800 transition-colors"
        >
          המשך
        </button>
      </div>
    </div>
  );
}
