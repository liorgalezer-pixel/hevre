"use client";

import { useState, useEffect, useRef, use } from "react";
import { ChevronRight, ChevronLeft, ImageIcon, ChevronDown, Check, X } from "lucide-react";
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
      <button onClick={() => setOpen(v => !v)} className={`flex items-center gap-1.5 border rounded-xl px-4 py-2.5 text-base font-semibold min-w-[90px] justify-center ${value ? "bg-blue-50 border-blue-100 text-gray-800" : "bg-white border-gray-200 text-gray-300"}`}>
        {value || "--:--"}<ChevronDown size={14} className="text-gray-400" />
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

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4].map(s => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shrink-0 ${s < step ? "bg-blue-700 text-white" : s === step ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-400"}`}>
            {s < step ? <Check size={14} strokeWidth={3} /> : s}
          </div>
          {s < 4 && <div className={`h-1 flex-1 rounded-full ${s < step ? "bg-blue-700" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  );
}

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 1
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Step 2
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState<string[]>([""]);

  // Step 3
  const [salary, setSalary] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [weekend, setWeekend] = useState(false);
  const [holidays, setHolidays] = useState(false);
  const [license, setLicense] = useState(false);
  const [car, setCar] = useState(false);
  const [housing, setHousing] = useState(false);

  // Step 4
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");

  useEffect(() => {
    (async () => {
      const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();
      if (!job) { setLoaded(true); return; }
      setLogoPreview(job.logo_url || null);
      setCompanyName(job.company_name || "");
      if (job.job_states?.length) setSelectedStates(job.job_states);
      if (job.job_cities?.length) setSelectedCities(job.job_cities);
      setSelectedCategories(job.categories || []);
      setJobTitle(job.title || "");
      setDescription(job.description || "");
      const reqs = Array.isArray(job.requirements) && job.requirements.length > 0
        ? job.requirements
        : [""];
      setRequirements(reqs);
      setSalary(job.salary || "");
      setStartTime(job.start_time || "");
      setEndTime(job.end_time || "");
      setWeekend(!!job.weekend);
      setHolidays(!!job.holidays);
      setLicense(!!job.license);
      setCar(!!job.car);
      setHousing(!!job.housing);
      setQ1(job.q1 || "");
      setQ2(job.q2 || "");
      setQ3(job.q3 || "");
      setLoaded(true);
    })();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addRequirement = () => setRequirements(prev => [...prev, ""]);
  const updateRequirement = (i: number, val: string) =>
    setRequirements(prev => prev.map((r, idx) => idx === i ? val : r));
  const removeRequirement = (i: number) =>
    setRequirements(prev => prev.filter((_, idx) => idx !== i));

  const canProceed1 = companyName.trim().length > 0 && (selectedStates.length > 0 || selectedCities.length > 0) && selectedCategories.length > 0;
  const canProceed2 = jobTitle.trim().length > 0 && description.trim().length > 0;
  const canProceed3 = salary.trim().length > 0 && startTime.length > 0 && endTime.length > 0;

  const handleSave = async () => {
    const reqArray = requirements.filter(r => r.trim().length > 0);
    const { error } = await supabase.from("jobs").update({
      title: jobTitle,
      company_name: companyName,
      company_address: selectedCities[0] || selectedStates[0] || "",
      job_states: selectedStates,
      job_cities: selectedCities,
      categories: selectedCategories,
      description,
      requirements: reqArray,
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
    else alert("שגיאה: " + error.message);
  };

  if (!loaded) return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center" dir="rtl">
      <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      <header className="bg-white px-4 pt-12 pb-4 sticky top-0 z-30 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : router.back()} className="w-11 h-11 flex items-center justify-center">
            <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">עריכת משרה</h1>
          <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
        </div>
        <ProgressBar step={step} />
      </header>

      <main className="flex-1 px-4 pt-6 pb-36 flex flex-col gap-5">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
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

            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-gray-900 text-right">שם החברה <span className="text-red-500">*</span></label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} dir="rtl"
                className="w-full h-13 rounded-xl border border-gray-200 bg-white px-4 text-right text-base outline-none focus:border-blue-500 placeholder:text-gray-300" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-gray-900 text-right">מיקום המשרה <span className="text-red-500">*</span></label>
              <LocationPicker
                selectedStates={selectedStates}
                selectedCities={selectedCities}
                onStatesChange={setSelectedStates}
                onCitiesChange={setSelectedCities}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-base font-bold text-gray-900 text-right">קטגוריה <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(({ id: catId, label, icon: Icon }) => {
                  const active = selectedCategories.includes(catId);
                  return (
                    <button key={catId}
                      onClick={() => setSelectedCategories(prev => prev.includes(catId) ? [] : [catId])}
                      className={`flex flex-col items-center justify-center gap-2 h-20 rounded-2xl border-2 transition-all ${active ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"}`}>
                      <Icon size={26} className={active ? "text-blue-700" : "text-gray-500"} strokeWidth={1.5} />
                      <span className={`text-xs font-semibold ${active ? "text-blue-700" : "text-gray-600"}`}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <div>
              <p className="text-sm text-gray-400 font-medium mb-0.5">עריכת משרה</p>
              <h2 className="text-2xl font-black text-blue-900">פרטי המשרה</h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-gray-900 text-right">כותרת המשרה <span className="text-red-500">*</span></label>
              <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} dir="rtl"
                className="w-full h-13 rounded-xl border border-gray-200 bg-white px-4 text-right text-base outline-none focus:border-blue-500 placeholder:text-gray-300" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-gray-900 text-right">תיאור המשרה <span className="text-red-500">*</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} dir="rtl" rows={5}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-base outline-none focus:border-blue-500 placeholder:text-gray-300 resize-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-gray-900 text-right">דרישות תפקיד</label>
              <div className="flex flex-col gap-2">
                {requirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2" style={{ direction: "rtl" }}>
                    <span className="text-green-500 shrink-0 text-lg">✓</span>
                    <input type="text" value={req} placeholder="הוסף דרישה..." onChange={e => updateRequirement(i, e.target.value)} dir="rtl"
                      className="flex-1 h-11 rounded-xl border border-gray-200 bg-white px-3 text-right text-sm outline-none focus:border-blue-500 placeholder:text-gray-300" />
                    {requirements.length > 1 && (
                      <button onClick={() => removeRequirement(i)} className="w-8 h-8 flex items-center justify-center text-gray-300 active:text-red-400 shrink-0">
                        <X size={16} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addRequirement} disabled={requirements.length >= 6 || requirements[requirements.length - 1].trim() === ""}
                className="self-start flex items-center gap-1.5 text-sm font-bold mt-1 disabled:opacity-30 text-blue-700 active:opacity-70">
                <span className="text-lg leading-none">+</span> הוסף דרישה
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <>
            <div>
              <p className="text-sm text-gray-400 font-medium mb-0.5">עריכת משרה</p>
              <h2 className="text-2xl font-black text-blue-900">תנאי משרה</h2>
            </div>

            <div className="flex items-center gap-3" style={{ direction: "ltr" }}>
              <input type="text" placeholder="למשל 2000-4000" value={salary} onChange={e => setSalary(e.target.value)} dir="rtl"
                className="flex-1 h-13 rounded-xl border border-blue-100 bg-blue-50 px-4 text-right text-base outline-none focus:border-blue-400 placeholder:text-gray-500 font-medium" />
              <label className="text-base font-medium text-gray-700 shrink-0 whitespace-nowrap">שכר שבועי ממוצע <span className="text-red-500">*</span></label>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-base font-black text-gray-900 text-right">שעות עבודה <span className="text-red-500">*</span></h3>
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

            <div className="flex flex-col gap-3">
              <h3 className="text-base font-black text-gray-900 text-right">תנאים נוספים</h3>
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
          </>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <>
            <div>
              <p className="text-sm text-gray-400 font-medium mb-0.5">עריכת משרה</p>
              <h2 className="text-2xl font-black text-blue-900">שאלות לסינון</h2>
            </div>

            {[
              { label: "שאלה 1", value: q1, set: setQ1 },
              { label: "שאלה 2", value: q2, set: setQ2 },
              { label: "שאלה 3", value: q3, set: setQ3 },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between" style={{ direction: "ltr" }}>
                  <span className="text-xs text-gray-400">אופציונלי</span>
                  <span className="text-base font-bold text-gray-900">{label}</span>
                </div>
                <textarea value={value} onChange={e => set(e.target.value)} dir="rtl" rows={3}
                  placeholder="כתוב את השאלה כאן..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-base outline-none focus:border-blue-500 placeholder:text-gray-300 resize-none" />
              </div>
            ))}
          </>
        )}

      </main>

      {/* Bottom nav */}
      <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 px-4 py-4 flex gap-3">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)}
            className="h-14 px-5 border border-gray-200 text-gray-600 font-bold text-sm rounded-2xl active:bg-gray-50 flex items-center gap-1.5 shrink-0">
            <ChevronLeft size={16} strokeWidth={2.5} />
            חזור
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={step === 1 ? !canProceed1 : step === 2 ? !canProceed2 : !canProceed3}
            className="flex-1 h-14 bg-blue-700 text-white font-black text-base rounded-2xl active:bg-blue-800 disabled:opacity-40 transition-opacity">
            הבא
          </button>
        ) : (
          <button onClick={handleSave}
            className="flex-1 h-14 bg-blue-700 text-white font-black text-base rounded-2xl active:bg-blue-800">
            שמור שינויים
          </button>
        )}
      </div>

      {showSuccess && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-3xl w-full px-6 py-10 flex flex-col items-center gap-5 shadow-xl">
              <div className="text-5xl">✅</div>
              <h2 className="text-xl font-black text-gray-900 text-center">השינויים נשמרו!</h2>
              <button onClick={() => router.back()}
                className="w-full h-14 bg-blue-700 text-white font-bold text-base rounded-2xl active:bg-blue-800">
                חזרה למשרה
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
