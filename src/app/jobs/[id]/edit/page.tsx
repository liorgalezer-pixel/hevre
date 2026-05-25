"use client";

import { useState, useEffect, use, useRef } from "react";
import { ChevronLeft, X, CheckCircle2, Plus, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/categories";
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
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-cream ring-1 ring-divider rounded-xl h-11 px-3 min-w-[90px] justify-between focus:ring-terracotta">
        <ChevronDown size={14} className="text-ink-3 shrink-0" />
        <span className={`text-sm font-mono ${value ? "text-ink" : "text-ink-3"}`}>{value || "--:--"}</span>
      </button>
      {open && (
        <div className="absolute z-50 bottom-12 left-0 bg-paper ring-1 ring-divider rounded-2xl shadow-lg overflow-y-auto max-h-48 min-w-[90px]">
          {TIMES.map(t => (
            <button key={t} type="button" onClick={() => { onChange(t); setOpen(false); }}
              className={`w-full px-4 py-2.5 text-sm font-mono text-left hover:bg-cream transition-colors ${value === t ? "text-terracotta font-bold" : "text-ink"}`}>
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JobEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [onDuty, setOnDuty] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [license, setLicense] = useState(false);
  const [car, setCar] = useState(false);
  const [housing, setHousing] = useState(false);
  const [weekend, setWeekend] = useState(false);
  const [holidays, setHolidays] = useState(false);
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase
        .from("jobs").select("*")
        .eq("id", id).eq("created_by", user.id).single();
      if (!data) { router.push("/my-jobs"); return; }
      setTitle(data.title || "");
      setCompanyName(data.company_name || "");
      setDescription(data.description || "");
      setSalary(data.salary || "");
      const isOnDuty = data.start_time === "כוננות" || !data.start_time;
      setOnDuty(isOnDuty);
      setStartTime(isOnDuty ? "" : (data.start_time || ""));
      setEndTime(isOnDuty ? "" : (data.end_time || ""));
      setSelectedStates(data.job_states || []);
      setSelectedCities(data.job_cities || []);
      setSelectedCategories(data.categories || []);
      setRequirements(data.requirements?.length ? data.requirements : [""]);
      setLicense(!!data.license);
      setCar(!!data.car);
      setHousing(!!data.housing);
      setWeekend(!!data.weekend);
      setHolidays(!!data.holidays);
      setQ1(data.q1 || "");
      setQ2(data.q2 || "");
      setQ3(data.q3 || "");
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("jobs").update({
      title,
      company_name: companyName,
      description,
      salary,
      start_time: onDuty ? "כוננות" : startTime,
      end_time: onDuty ? "כוננות" : endTime,
      job_states: selectedStates,
      job_cities: selectedCities,
      company_address: selectedCities[0] || selectedStates[0] || "",
      categories: selectedCategories,
      requirements: requirements.filter(r => r.trim()),
      license,
      car,
      housing,
      weekend,
      holidays,
      q1: q1 || null,
      q2: q2 || null,
      q3: q3 || null,
    }).eq("id", id);
    setSaving(false);
    setSaved(true);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const addRequirement = () => setRequirements(prev => [...prev, ""]);
  const updateRequirement = (i: number, val: string) =>
    setRequirements(prev => prev.map((r, idx) => idx === i ? val : r));
  const removeRequirement = (i: number) =>
    setRequirements(prev => prev.filter((_, idx) => idx !== i));

  if (loading) return (
    <div className="flex flex-col min-h-screen items-center justify-center" dir="rtl">
      <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (saved) return (
    <div className="flex flex-col min-h-screen bg-cream items-center justify-center px-6 gap-6" dir="rtl">
      <div className="w-24 h-24 rounded-full bg-warm-success-bg flex items-center justify-center">
        <CheckCircle2 size={52} className="text-warm-success" strokeWidth={1.5} />
      </div>
      <div className="text-center flex flex-col gap-2">
        <h2 className="font-serif text-2xl font-bold text-ink tracking-tight">המודעה עודכנה!</h2>
        <p className="text-sm text-ink-2">השינויים נשמרו בהצלחה</p>
      </div>
      <button
        onClick={() => router.push(`/jobs/${id}`)}
        className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl active:opacity-90"
      >
        חזרה למודעה
      </button>
    </div>
  );

  const toggleProps = [
    { label: "חובה רישיון נהיגה", value: license, set: setLicense },
    { label: "מספק רכב", value: car, set: setCar },
    { label: "מספק דיור", value: housing, set: setHousing },
    { label: 'עבודה בסופ"ש', value: weekend, set: setWeekend },
    { label: "עבודה בחגים", value: holidays, set: setHolidays },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider sticky top-0 z-40">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">עריכת מודעה</h1>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronLeft size={24} className="text-ink-2" strokeWidth={2} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-36 flex flex-col gap-5">

        {/* Basic info */}
        <div className="bg-paper rounded-2xl px-4 py-5 flex flex-col gap-4">
          <h2 className="font-serif text-base font-bold text-ink tracking-tight">פרטי המשרה</h2>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">כותרת המשרה *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="למשל: מלצר/ית" dir="rtl"
              className="w-full bg-cream ring-1 ring-divider rounded-xl h-11 px-3 text-right text-sm outline-none placeholder:text-ink-3 focus:ring-terracotta" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">שם העסק</label>
            <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="שם העסק שלך" dir="rtl"
              className="w-full bg-cream ring-1 ring-divider rounded-xl h-11 px-3 text-right text-sm outline-none placeholder:text-ink-3 focus:ring-terracotta" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">שכר שבועי ממוצע</label>
            <input type="text" value={salary} onChange={e => setSalary(e.target.value)} placeholder="למשל: $18/שעה" dir="rtl"
              className="w-full bg-cream ring-1 ring-divider rounded-xl h-11 px-3 text-right text-sm outline-none placeholder:text-ink-3 focus:ring-terracotta" />
          </div>

          {/* Work hours */}
          <div className="flex flex-col gap-3">
            <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">שעות עבודה</label>
            {!onDuty && (
              <>
                <div className="flex items-center justify-center gap-6" dir="rtl">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">התחלה</span>
                    <TimePicker value={startTime} onChange={setStartTime} />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">סיום</span>
                    <TimePicker value={endTime} onChange={setEndTime} />
                  </div>
                </div>
                <p className="text-xs text-ink-3 text-right">(אופציה לבחור בקפיצות של חצי שעה)</p>
              </>
            )}
            <div className="flex items-center justify-between bg-cream ring-1 ring-divider rounded-2xl px-4 py-3">
              <button
                type="button"
                onClick={() => { setOnDuty(!onDuty); if (!onDuty) { setStartTime(""); setEndTime(""); } }}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${onDuty ? "bg-terracotta" : "bg-divider"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${onDuty ? "right-0.5" : "left-0.5"}`} />
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-ink">עבודת כוננות / שעות משתנות</p>
                <p className="text-xs text-ink-3">שעות העבודה אינן קבועות</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-paper rounded-2xl px-4 py-5 flex flex-col gap-4">
          <h2 className="font-serif text-base font-bold text-ink tracking-tight">מיקום</h2>
          <LocationPicker
            selectedStates={selectedStates}
            onStatesChange={setSelectedStates}
            selectedCities={selectedCities}
            onCitiesChange={setSelectedCities}
          />
        </div>

        {/* Categories */}
        <div className="bg-paper rounded-2xl px-4 py-5 flex flex-col gap-3">
          <h2 className="font-serif text-base font-bold text-ink tracking-tight">קטגוריות</h2>
          <div className="flex flex-wrap gap-2 justify-end">
            {CATEGORIES.map(({ id, label }) => (
              <button key={id} onClick={() => toggleCategory(id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ring-1 transition-colors ${
                  selectedCategories.includes(id) ? "bg-ink text-cream ring-ink" : "bg-cream text-ink-2 ring-divider"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-paper rounded-2xl px-4 py-5 flex flex-col gap-3">
          <h2 className="font-serif text-base font-bold text-ink tracking-tight">תיאור המשרה</h2>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="תאר את התפקיד, סביבת העבודה, ומה מחפשים..." rows={5} dir="rtl"
            className="w-full bg-cream ring-1 ring-divider rounded-xl px-3 py-3 text-sm text-right outline-none resize-none placeholder:text-ink-3 focus:ring-terracotta" />
        </div>

        {/* Requirements */}
        <div className="bg-paper rounded-2xl px-4 py-5 flex flex-col gap-3">
          <h2 className="font-serif text-base font-bold text-ink tracking-tight">דרישות התפקיד</h2>
          <div className="flex flex-col gap-2">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2" style={{ direction: "ltr" }}>
                {requirements.length > 1 && (
                  <button onClick={() => removeRequirement(i)} className="shrink-0 w-7 h-7 flex items-center justify-center">
                    <X size={14} className="text-warm-danger" strokeWidth={2} />
                  </button>
                )}
                <input type="text" value={req} onChange={e => updateRequirement(i, e.target.value)} placeholder="דרישה..." dir="rtl"
                  className="flex-1 bg-cream ring-1 ring-divider rounded-xl h-10 px-3 text-right text-sm outline-none placeholder:text-ink-3 focus:ring-terracotta" />
              </div>
            ))}
          </div>
          <button onClick={addRequirement} className="flex items-center gap-1.5 text-sm text-terracotta font-medium self-end active:opacity-70">
            <Plus size={15} strokeWidth={2.5} />
            הוסף דרישה
          </button>
        </div>

        {/* Toggles */}
        <div className="bg-paper rounded-2xl px-4 py-5 flex flex-col gap-4">
          <h2 className="font-serif text-base font-bold text-ink tracking-tight">תנאים נוספים</h2>
          {toggleProps.map(({ label, value, set }) => (
            <div key={label} className="flex items-center justify-between">
              <button type="button" onClick={() => set(!value)}
                className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${value ? "bg-terracotta" : "bg-cream-warm"}`}>
                <span className={`absolute top-0.5 w-6 h-6 bg-paper rounded-full shadow transition-all ${value ? "right-0.5" : "left-0.5"}`} />
              </button>
              <span className="text-sm font-medium text-ink text-right">{label}</span>
            </div>
          ))}
        </div>

        {/* Screening questions */}
        <div className="bg-paper rounded-2xl px-4 py-5 flex flex-col gap-4">
          <div className="text-right">
            <h2 className="font-serif text-base font-bold text-ink tracking-tight">שאלות סינון</h2>
            <p className="text-xs text-ink-3 mt-0.5">אופציונלי — שאלות שהמועמד יצטרך לענות</p>
          </div>
          {[{ label: "שאלה 1", value: q1, set: setQ1 }, { label: "שאלה 2", value: q2, set: setQ2 }, { label: "שאלה 3", value: q3, set: setQ3 }].map(({ label, value, set }) => (
            <div key={label} className="flex flex-col gap-1">
              <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">{label}</label>
              <textarea value={value} onChange={e => set(e.target.value)} placeholder="כתוב את השאלה כאן..." rows={2} dir="rtl"
                className="w-full bg-cream ring-1 ring-divider rounded-xl px-3 py-2.5 text-sm text-right outline-none resize-none placeholder:text-ink-3 focus:ring-terracotta" />
            </div>
          ))}
        </div>

      </div>

      <div className="fixed bottom-0 right-0 left-0 bg-paper border-t border-divider px-4 py-4">
        <button onClick={handleSave} disabled={saving || !title.trim()}
          className="w-full h-14 bg-ink text-cream font-serif font-semibold text-lg rounded-2xl disabled:opacity-40 active:opacity-90 transition-opacity">
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </div>
    </div>
  );
}
