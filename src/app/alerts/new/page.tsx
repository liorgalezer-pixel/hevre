"use client";

import { useState } from "react";
import { ChevronRight, Bell } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LocationPicker from "@/components/LocationPicker";
import Toggle from "@/components/Toggle";
import { CATEGORIES } from "@/lib/categories";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export default function NewAlertPage() {
  const router = useRouter();
  const [alertName, setAlertName] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [license, setLicense] = useState(false);
  const [car, setCar] = useState(false);
  const [weekend, setWeekend] = useState(false);
  const [holidays, setHolidays] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleCat = (id: string) =>
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const handleSave = () => {
    if (selectedCats.length === 0) return;
    const alerts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALERTS) || "[]");
    alerts.push({
      id: Date.now().toString(),
      name: alertName || selectedCats.map(id => CATEGORIES.find(c => c.id === id)?.label).join(", "),
      categories: selectedCats,
      states: selectedStates,
      cities: selectedCities,
      license,
      car,
      weekend,
      holidays,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center px-6 gap-5" dir="rtl">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
          <Bell size={36} className="text-blue-700" strokeWidth={1.4} />
        </div>
        <h2 className="text-xl font-black text-gray-900 text-center">ההתראה נוצרה בהצלחה!</h2>
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          נעדכן אותך ברגע שיתפרסמו משרות חדשות שתואמות לקריטריונים שהגדרת
        </p>
        <button
          onClick={() => router.push("/alerts")}
          className="w-full h-14 bg-blue-700 text-white font-bold text-base rounded-2xl active:bg-blue-800"
        >
          חזרה להתראות
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">

      {/* Header */}
      <header className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-base font-bold text-gray-900">התראה חדשה</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={72} height={28} className="object-contain" />
      </header>

      <main className="flex-1 px-5 pt-6 pb-32 flex flex-col gap-7">

        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">הגדרת התראה</h2>
          <p className="text-sm text-gray-400">קבל עדכון ברגע שתעלה משרה שמתאימה לך</p>
        </div>

        {/* Alert name */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-gray-500 text-right">שם ההתראה (אופציונלי)</p>
          <input
            type="text"
            value={alertName}
            onChange={(e) => setAlertName(e.target.value)}
            placeholder="למשל: עבודת לוקסמיט בניו יורק"
            className="w-full h-12 border border-gray-200 rounded-2xl px-4 text-right text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 transition-colors"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-500 text-right">
            קטגוריית עבודה <span className="text-red-400">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ id, icon: Icon, label }) => {
              const active = selectedCats.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleCat(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-colors ${
                    active ? "bg-blue-700 text-white border-blue-700" : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  <Icon size={14} strokeWidth={1.8} />
                  {label}
                </button>
              );
            })}
          </div>
          {selectedCats.length === 0 && (
            <p className="text-xs text-gray-400 text-right">בחר לפחות קטגוריה אחת</p>
          )}
        </div>

        {/* Location */}
        <LocationPicker
          selectedStates={selectedStates}
          selectedCities={selectedCities}
          onStatesChange={setSelectedStates}
          onCitiesChange={setSelectedCities}
        />

        {/* Toggles */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-gray-500 text-right">תנאים נוספים</p>
          {[
            { label: "חובת רישיון נהיגה", value: license, onChange: () => setLicense((v) => !v) },
            { label: "כולל רכב", value: car, onChange: () => setCar((v) => !v) },
            { label: "עבודה בסוף שבוע", value: weekend, onChange: () => setWeekend((v) => !v) },
            { label: "עבודה בחגים", value: holidays, onChange: () => setHolidays((v) => !v) },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">{label}</span>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>

      </main>

      {/* Save button */}
      <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 px-5 py-4">
        <button
          onClick={handleSave}
          disabled={selectedCats.length === 0}
          className={`w-full h-14 font-black text-base rounded-2xl flex items-center justify-center gap-2 transition-colors ${
            selectedCats.length > 0
              ? "bg-blue-700 text-white active:bg-blue-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Bell size={18} strokeWidth={2} />
          שמור התראה
        </button>
      </div>
    </div>
  );
}
