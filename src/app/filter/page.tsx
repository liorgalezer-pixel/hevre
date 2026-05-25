"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import LocationPicker from "@/components/LocationPicker";
import Toggle from "@/components/Toggle";
import { CATEGORIES } from "@/lib/categories";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export default function FilterPage() {
  const router = useRouter();
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [hoursEnabled, setHoursEnabled] = useState(false);
  const [fromTime, setFromTime] = useState("09:00");
  const [toTime, setToTime] = useState("17:00");
  const [license, setLicense] = useState(false);
  const [car, setCar] = useState(false);
  const [housing, setHousing] = useState(false);
  const [weekend, setWeekend] = useState(false);
  const [holidays, setHolidays] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.FILTERS);
    if (stored) {
      try {
        const d = JSON.parse(stored);
        if (d.categories) setSelectedCats(d.categories);
        if (d.states) setSelectedStates(d.states);
        if (d.cities) setSelectedCities(d.cities);
        if (d.fromTime) setFromTime(d.fromTime);
        if (d.toTime) setToTime(d.toTime);
        if (typeof d.license === "boolean") setLicense(d.license);
        if (typeof d.car === "boolean") setCar(d.car);
        if (typeof d.housing === "boolean") setHousing(d.housing);
        if (typeof d.weekend === "boolean") setWeekend(d.weekend);
        if (typeof d.holidays === "boolean") setHolidays(d.holidays);
      } catch {}
    }
  }, []);

  const hours = useMemo(() => Array.from({ length: 25 }, (_, i) => `${i.toString().padStart(2, "0")}:00`), []);

  const toggleCat = (id: string) =>
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const handleApply = () => {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify({
      categories: selectedCats,
      states: selectedStates,
      cities: selectedCities,
      fromTime: hoursEnabled ? fromTime : null,
      toTime: hoursEnabled ? toTime : null,
      license,
      car,
      housing,
      weekend,
      holidays,
    }));
    router.push("/");
  };

  const handleReset = () => {
    setSelectedCats([]);
    setSelectedStates([]);
    setSelectedCities([]);
    setFromTime("09:00");
    setToTime("17:00");
    setLicense(false);
    setCar(false);
    setHousing(false);
    setWeekend(false);
    setHolidays(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-paper" dir="rtl">

      {/* Header */}
      <header className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">סינון</h1>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronLeft size={24} className="text-ink-2" strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 px-5 pt-6 pb-32 flex flex-col gap-7">

        {/* Title */}
        <h2 className="font-serif text-2xl font-bold text-ink text-right tracking-tight">סינון עבודות</h2>

        {/* Categories */}
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">קטגוריית עבודת</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ id, icon: Icon, label }) => {
              const active = selectedCats.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleCat(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full ring-1 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-ink text-cream ring-ink"
                      : "bg-paper text-ink-2 ring-divider"
                  }`}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <LocationPicker
          selectedStates={selectedStates}
          selectedCities={selectedCities}
          onStatesChange={setSelectedStates}
          onCitiesChange={setSelectedCities}
        />

        {/* Time range */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between" style={{ direction: "ltr" }}>
            <button
              onClick={() => setHoursEnabled(v => !v)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${hoursEnabled ? "bg-terracotta" : "bg-cream-warm"}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-paper shadow transition-transform ${hoursEnabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">שעות עבודה</p>
          </div>
          {hoursEnabled && (
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <span className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">סיום</span>
                <select
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="h-11 w-24 bg-cream ring-1 ring-divider rounded-xl px-3 text-sm text-ink outline-none text-center"
                >
                  {hours.map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
              <span className="text-ink-3 font-bold text-lg mt-4">—</span>
              <div className="flex flex-col items-center gap-1">
                <span className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">התחלה</span>
                <select
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="h-11 w-24 bg-cream ring-1 ring-divider rounded-xl px-3 text-sm text-ink outline-none text-center"
                >
                  {hours.map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-4">
          {[
            { label: "חובת רישיון נהיגה", value: license, onChange: () => setLicense((v) => !v) },
            { label: "מספק רכב", value: car, onChange: () => setCar((v) => !v) },
            { label: "מספק דיור", value: housing, onChange: () => setHousing((v) => !v) },
            { label: "עבודה בסוף שבוע", value: weekend, onChange: () => setWeekend((v) => !v) },
            { label: "עבודה בחגים", value: holidays, onChange: () => setHolidays((v) => !v) },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-base font-bold text-ink">{label}</span>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-sm text-ink-3 text-center leading-relaxed">
          הגדרות הסינון יישמרו ויחולו על תוצאות החיפוש
        </p>

      </main>

      {/* Bottom buttons */}
      <div className="fixed bottom-0 right-0 left-0 bg-paper border-t border-divider px-5 py-4 flex gap-3">
        <button
          onClick={handleReset}
          className="h-14 px-5 ring-1 ring-divider text-ink-2 font-bold text-sm rounded-2xl active:bg-cream shrink-0"
        >
          איפוס
        </button>
        <button
          onClick={handleApply}
          className="flex-1 h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl active:bg-terracotta-deep flex items-center justify-center gap-2"
        >
          + החל סינון
        </button>
      </div>
    </div>
  );
}
