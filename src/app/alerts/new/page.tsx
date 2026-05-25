"use client";

import { useState, useEffect, Suspense } from "react";
import { ChevronLeft, Bell } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import LocationPicker from "@/components/LocationPicker";
import Toggle from "@/components/Toggle";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/lib/supabase";

export default function NewAlertPage() {
  return <Suspense><NewAlertContent /></Suspense>;
}

function NewAlertContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [alertName, setAlertName] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [license, setLicense] = useState(false);
  const [car, setCar] = useState(false);
  const [weekend, setWeekend] = useState(false);
  const [holidays, setHolidays] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      const { data } = await supabase.from("job_alerts").select("*").eq("id", editId).single();
      if (!data) return;
      setAlertName(data.name || "");
      setSelectedCats(data.categories || []);
      setSelectedStates(data.states || []);
      setSelectedCities(data.cities || []);
      setLicense(data.license || false);
      setCar(data.car || false);
      setWeekend(data.weekend || false);
      setHolidays(data.holidays || false);
    })();
  }, [editId]);

  const toggleCat = (id: string) =>
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const handleSave = async () => {
    if (selectedCats.length === 0) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const name = alertName || selectedCats.map(id => CATEGORIES.find(c => c.id === id)?.label).join(", ");
    const payload = { name, categories: selectedCats, states: selectedStates, cities: selectedCities, license, car, weekend, holidays };

    if (editId) {
      await supabase.from("job_alerts").update(payload).eq("id", editId);
    } else {
      await supabase.from("job_alerts").insert({ ...payload, user_id: user.id });
    }
    setSaving(false);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="flex flex-col min-h-screen bg-paper items-center justify-center px-6 gap-5" dir="rtl">
        <div className="w-20 h-20 bg-cream-warm rounded-full flex items-center justify-center">
          <Bell size={36} className="text-terracotta" strokeWidth={1.4} />
        </div>
        <h2 className="font-serif text-xl font-bold text-ink text-center tracking-tight">
          {editId ? "ההתראה עודכנה בהצלחה!" : "ההתראה נוצרה בהצלחה!"}
        </h2>
        <p className="text-sm text-ink-2 text-center leading-relaxed">
          נעדכן אותך ברגע שיתפרסמו משרות חדשות שתואמות לקריטריונים שהגדרת
        </p>
        <button
          onClick={() => router.push("/alerts")}
          className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl active:bg-terracotta-deep"
        >
          חזרה להתראות
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-paper" dir="rtl">

      <header className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <h1 className="font-serif text-base font-bold text-ink tracking-tight">{editId ? "עריכת התראה" : "התראה חדשה"}</h1>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronLeft size={24} className="text-ink-2" strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 px-5 pt-6 pb-32 flex flex-col gap-7">

        <div>
          <h2 className="font-serif text-2xl font-bold text-ink mb-1 tracking-tight">הגדרת התראה</h2>
          <p className="text-sm text-ink-3">קבל עדכון ברגע שתעלה משרה שמתאימה לך</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">שם ההתראה</p>
          <input
            type="text"
            value={alertName}
            onChange={(e) => setAlertName(e.target.value)}
            placeholder="למשל: עבודת לוקסמיט בניו יורק"
            className="w-full h-12 bg-cream ring-1 ring-divider rounded-2xl px-4 text-right text-sm text-ink placeholder:text-ink-3 outline-none focus:ring-terracotta transition-colors"
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">
            קטגוריית עבודה <span className="text-warm-danger">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ id, icon: Icon, label }) => {
              const active = selectedCats.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleCat(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full ring-1 text-sm font-semibold transition-colors ${
                    active ? "bg-ink text-cream ring-ink" : "bg-paper text-ink-2 ring-divider"
                  }`}
                >
                  <Icon size={14} strokeWidth={1.8} />
                  {label}
                </button>
              );
            })}
          </div>
          {selectedCats.length === 0 && (
            <p className="text-xs text-ink-3 text-right">בחר לפחות קטגוריה אחת</p>
          )}
        </div>

        <LocationPicker
          selectedStates={selectedStates}
          selectedCities={selectedCities}
          onStatesChange={setSelectedStates}
          onCitiesChange={setSelectedCities}
        />

        <div className="flex flex-col gap-4">
          <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">תנאים נוספים</p>
          {[
            { label: "חובת רישיון נהיגה", value: license, onChange: () => setLicense((v) => !v) },
            { label: "כולל רכב", value: car, onChange: () => setCar((v) => !v) },
            { label: "עבודה בסוף שבוע", value: weekend, onChange: () => setWeekend((v) => !v) },
            { label: "עבודה בחגים", value: holidays, onChange: () => setHolidays((v) => !v) },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-base font-bold text-ink">{label}</span>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>

      </main>

      <div className="fixed bottom-0 right-0 left-0 bg-paper border-t border-divider px-5 py-4">
        <button
          onClick={handleSave}
          disabled={selectedCats.length === 0 || saving}
          className={`w-full h-14 font-serif font-semibold text-base rounded-2xl flex items-center justify-center gap-2 transition-colors ${
            selectedCats.length > 0 && !saving
              ? "bg-ink text-cream active:bg-terracotta-deep"
              : "bg-cream-warm text-ink-3 cursor-not-allowed"
          }`}
        >
          {saving ? <span className="animate-pulse">שומר...</span> : <><Bell size={18} strokeWidth={2} />שמור התראה</>}
        </button>
      </div>
    </div>
  );
}
