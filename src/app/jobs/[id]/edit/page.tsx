"use client";

import { useState, useEffect, useRef, use } from "react";
import { ChevronRight, ImageIcon, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/lib/supabase";
import LocationPicker from "@/components/LocationPicker";

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
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-base font-semibold text-gray-800 min-w-[90px] justify-center">
        {value}<ChevronDown size={14} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-white rounded-xl shadow-lg border border-gray-100 w-28 max-h-52 overflow-y-auto">
          {TIMES.map(t => (
            <button key={t} onClick={() => { onChange(t); setOpen(false); }} className={`w-full text-center py-2.5 text-sm font-medium hover:bg-blue-50 ${t === value ? "bg-blue-100 text-blue-700 font-bold" : "text-gray-700"}`}>{t}</button>
          ))}
        </div>
      )}
    </div>
  );
}


function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${value ? "bg-blue-600" : "bg-gray-300"}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-1" : "translate-x-6"}`} />
    </button>
  );
}

type JobData = {
  id: string;
  title: string;
  companyName?: string;
  companyAddress: string;
  description?: string;
  categories: string[];
  logoPreview: string | null;
  salary: string;
  startTime: string;
  endTime: string;
  weekend: boolean;
  holidays: boolean;
  license: boolean;
  car: boolean;
  housing: boolean;
  q1?: string;
  q2?: string;
  q3?: string;
  [key: string]: unknown;
};

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [weekend, setWeekend] = useState(false);
  const [holidays, setHolidays] = useState(false);
  const [license, setLicense] = useState(false);
  const [car, setCar] = useState(false);
  const [housing, setHousing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    (async () => {
      const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();
      if (!job) return;
      setJobTitle(job.title || "");
      setCompanyName(job.company_name || "");
      if (job.job_states?.length) setSelectedStates(job.job_states);
      if (job.job_cities?.length) setSelectedCities(job.job_cities);
      setDescription(job.description || "");
      setSalary(job.salary || "");
      setStartTime(job.start_time || "08:00");
      setEndTime(job.end_time || "18:00");
      setWeekend(!!job.weekend);
      setHolidays(!!job.holidays);
      setLicense(!!job.license);
      setCar(!!job.car);
      setHousing(!!job.housing);
      setSelectedCategories(job.categories || []);
      setQ1(job.q1 || "");
      setQ2(job.q2 || "");
      setQ3(job.q3 || "");
      setLogoPreview(job.logo_url || null);
    })();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const { error } = await supabase.from("jobs").update({
      title: jobTitle,
      company_name: companyName,
      company_address: selectedCities[0] || selectedStates[0] || "",
      job_states: selectedStates,
      job_cities: selectedCities,
      description,
      categories: selectedCategories,
      salary,
      start_time: startTime,
      end_time: endTime,
      weekend,
      holidays,
      license,
      car,
      housing,
      q1, q2, q3,
      logo_url: logoPreview,
    }).eq("id", id);
    if (!error) setShowSuccess(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">עריכת משרה</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>

      <main className="flex-1 px-4 pt-6 pb-32 flex flex-col gap-5">

        {/* Logo */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center py-8 gap-3 active:bg-gray-50">
            {logoPreview
              ? <Image src={logoPreview} alt="לוגו" width={80} height={80} className="w-20 h-20 rounded-xl object-cover" />
              : <><ImageIcon size={48} className="text-gray-400" strokeWidth={1.2} /><p className="text-sm text-gray-500">הוספת תמונה / לוגו חברה</p></>
            }
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        {/* Company name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-gray-900 text-right">שם החברה</label>
          <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} dir="rtl" className="w-full h-13 rounded-xl border border-gray-200 bg-white px-4 text-right text-base outline-none focus:border-blue-500" />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-gray-900 text-right">מיקום המשרה</label>
          <LocationPicker
            selectedStates={selectedStates}
            selectedCities={selectedCities}
            onStatesChange={setSelectedStates}
            onCitiesChange={setSelectedCities}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-3">
          <label className="text-base font-bold text-gray-900 text-right">קטגוריה</label>
          <div className="flex flex-wrap gap-2 justify-end">
            {CATEGORIES.map(({ id: catId, label, icon: Icon }) => {
              const active = selectedCategories.includes(catId);
              return (
                <button key={catId} onClick={() => setSelectedCategories(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId])}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${active ? "bg-blue-700 text-white border-blue-700" : "bg-blue-50 text-gray-700 border-blue-100"}`}>
                  <span>{label}</span>
                  <Icon size={16} strokeWidth={1.6} />
                </button>
              );
            })}
          </div>
          {selectedCategories.includes("other") && (
            <input type="text" placeholder="תאר את הקטגוריה..." value={otherText} onChange={e => setOtherText(e.target.value)} dir="rtl"
              className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-right text-sm outline-none focus:border-blue-500 placeholder:text-gray-300" />
          )}
        </div>

        {/* Job title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-gray-900 text-right">שם המשרה</label>
          <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} dir="rtl" className="w-full h-13 rounded-xl border border-gray-200 bg-white px-4 text-right text-base outline-none focus:border-blue-500" />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-gray-900 text-right">תאור המשרה</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} dir="rtl" rows={4} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-base outline-none focus:border-blue-500 resize-none" />
        </div>

        {/* Salary */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-gray-900 text-right">שכר שבועי ממוצע</label>
          <input type="text" placeholder="למשל 2000-4000" value={salary} onChange={e => setSalary(e.target.value)} dir="rtl" className="w-full h-13 rounded-xl border border-blue-100 bg-blue-50 px-4 text-right text-base outline-none focus:border-blue-400 placeholder:text-gray-500" />
        </div>

        {/* Hours */}
        <div className="flex flex-col gap-3">
          <label className="text-base font-bold text-gray-900 text-right">שעות עבודה</label>
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
        </div>

        {/* Work conditions */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {[
            { label: "עבודה בסוף שבוע", value: weekend, set: setWeekend },
            { label: "עבודה בחגים", value: holidays, set: setHolidays },
          ].map(({ label, value, set }, idx, arr) => (
            <div key={label} className={`flex items-center justify-between px-4 py-4 ${idx < arr.length - 1 ? "border-b border-gray-100" : ""}`} style={{ direction: "ltr" }}>
              <Toggle value={value} onChange={set} />
              <span className="text-base text-gray-800">{label}</span>
            </div>
          ))}
        </div>

        {/* Additional conditions */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-gray-900 text-right">תנאים נוספים</label>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {[
              { label: "חייב רישיון נהיגה", value: license, set: setLicense },
              { label: "מספק רכב", value: car, set: setCar },
              { label: "מספק דיור", value: housing, set: setHousing },
            ].map(({ label, value, set }, idx, arr) => (
              <div key={label} className={`flex items-center justify-between px-4 py-4 ${idx < arr.length - 1 ? "border-b border-gray-100" : ""}`} style={{ direction: "ltr" }}>
                <Toggle value={value} onChange={set} />
                <span className="text-base text-gray-800">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Screening questions */}
        <div className="flex flex-col gap-3">
          <label className="text-base font-bold text-gray-900 text-right">שאלות לסינון</label>
          {[{ label: "שאלה 1", value: q1, set: setQ1 }, { label: "שאלה 2", value: q2, set: setQ2 }, { label: "שאלה 3", value: q3, set: setQ3 }].map(({ label, value, set }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 text-right">{label}</span>
              <textarea value={value} onChange={e => set(e.target.value)} dir="rtl" rows={3} placeholder="כתוב את השאלה כאן..." className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-sm outline-none focus:border-blue-500 placeholder:text-gray-300 resize-none" />
            </div>
          ))}
        </div>

      </main>

      <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 px-4 py-4">
        <button onClick={handleSave} className="w-full h-14 bg-blue-700 text-white font-bold text-lg rounded-2xl active:bg-blue-800 transition-colors">
          שמור שינויים
        </button>
      </div>

      {showSuccess && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-3xl w-full px-6 py-10 flex flex-col items-center gap-5 shadow-xl">
              <div className="text-5xl">✅</div>
              <h2 className="text-xl font-black text-gray-900 text-center">השינויים נשמרו!</h2>
              <button onClick={() => router.back()} className="w-full h-13 bg-blue-700 text-white font-bold text-base rounded-2xl active:bg-blue-800 py-3">
                חזרה למשרה
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
