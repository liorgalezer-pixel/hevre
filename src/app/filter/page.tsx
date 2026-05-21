"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
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
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">

      {/* Header */}
      <header className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-1">
          <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
            <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
          </button>
          <div className="w-11" />
        </div>
        <h1 className="text-lg font-bold text-gray-900">סינון</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>

      <main className="flex-1 px-5 pt-6 pb-32 flex flex-col gap-7">

        {/* Title */}
        <h2 className="text-2xl font-black text-gray-900 text-right">סינון עבודות</h2>

        {/* Categories */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-500 text-right">קטגוריית עבודת</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ id, icon: Icon, label }) => {
              const active = selectedCats.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleCat(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-colors ${
                    active
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-white text-gray-700 border-gray-300"
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
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${hoursEnabled ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${hoursEnabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <p className="text-sm font-semibold text-gray-700">שעות עבודה</p>
          </div>
          {hoursEnabled && (
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400 font-medium">סיום</span>
                <select
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="h-11 w-24 border border-gray-200 rounded-xl px-3 text-sm text-gray-800 outline-none bg-white text-center"
                >
                  {hours.map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
              <span className="text-gray-300 font-bold text-lg mt-4">—</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400 font-medium">התחלה</span>
                <select
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="h-11 w-24 border border-gray-200 rounded-xl px-3 text-sm text-gray-800 outline-none bg-white text-center"
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
              <span className="text-base font-bold text-gray-900">{label}</span>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-sm text-gray-400 text-center leading-relaxed">
          הגדרות הסינון יישמרו ויחולו על תוצאות החיפוש
        </p>

      </main>

      {/* Bottom buttons */}
      <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3">
        <button
          onClick={handleReset}
          className="h-14 px-5 border border-gray-200 text-gray-600 font-bold text-sm rounded-2xl active:bg-gray-50 shrink-0"
        >
          איפוס
        </button>
        <button
          onClick={handleApply}
          className="flex-1 h-14 bg-gray-900 text-white font-black text-base rounded-2xl active:bg-gray-800 flex items-center justify-center gap-2"
        >
          + החל סינון
        </button>
      </div>
    </div>
  );
}
