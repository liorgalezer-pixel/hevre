"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { US_STATES, US_CITIES } from "@/lib/us-locations";

// רשימת מדינות העולם
const WORLD_COUNTRIES = [
  "ישראל", "קנדה", "מקסיקו", "בריטניה", "גרמניה", "צרפת", "איטליה",
  "ספרד", "הולנד", "פורטוגל", "שוויץ", "אוסטריה", "בלגיה", "שוודיה",
  "נורבגיה", "דנמרק", "פינלנד", "פולין", "צ'כיה", "הונגריה", "רומניה",
  "יוון", "טורקיה", "רוסיה", "אוקראינה", "אוסטרליה", "ניו זילנד",
  "יפן", "סין", "קוריאה הדרומית", "הודו", "תאילנד", "סינגפור",
  "מלזיה", "אינדונזיה", "פיליפינים", "וייטנאם", "טייוואן",
  "איחוד האמירויות", "ערב הסעודית", "קטר", "כווית", "בחריין",
  "עומאן", "ירדן", "לבנון", "מצרים", "מרוקו", "תוניסיה", "אלג'יריה",
  "לוב", "דרום אפריקה", "אתיופיה", "קניה", "ניגריה", "גאנה",
  "קמרון", "סנגל", "סודן", "אוגנדה", "טנזניה", "מוזמביק",
  "ברזיל", "ארגנטינה", "צ'ילה", "קולומביה", "פרו", "ונצואלה",
  "אקוודור", "בוליביה", "פרגוואי", "אורוגוואי", "קובה",
  "גואטמלה", "קוסטה ריקה", "פנמה", "הונדורס", "אל סלבדור",
  "אירלנד", "סקוטלנד", "ויילס", "בולגריה", "סרביה", "קרואטיה",
  "סלובניה", "סלובקיה", "אסטוניה", "לטביה", "ליטא", "בלארוס",
  "מולדובה", "אלבניה", "צפון מקדוניה", "בוסניה", "מונטנגרו",
  "קפריסין", "מלטה", "איסלנד", "לוקסמבורג", "מונקו", "ליכטנשטיין",
  "אנדורה", "סן מרינו", "אזרבייג'ן", "גיאורגיה", "ארמניה",
  "קזחסטן", "אוזבקיסטן", "טורקמניסטן", "קירגיזסטן", "טג'יקיסטן",
  "אפגניסטן", "פקיסטן", "בנגלדש", "סרי לנקה", "נפאל", "מיאנמר",
  "קמבודיה", "לאוס", "מונגוליה", "קזחסטן", "פיג'י", "פפואה גינאה החדשה",
];

type LocationMode = "usa" | "world";

type Props = {
  country: string;
  setCountry: (v: string) => void;
  usState: string;
  setUsState: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
};

export default function UserLocationPicker({
  country, setCountry, usState, setUsState, city, setCity,
}: Props) {
  const [mode, setMode] = useState<LocationMode>(
    country === "ארה\"ב" || usState ? "usa" : country ? "world" : "usa"
  );

  // State dropdown
  const [stateOpen, setStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");

  // City dropdown (USA)
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  // World country dropdown
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const selectedState = US_STATES.find((s) => s.abbr === usState);

  const filteredStates = useMemo(
    () => US_STATES.filter(
      (s) =>
        s.en.toLowerCase().includes(stateSearch.toLowerCase()) ||
        s.he.includes(stateSearch) ||
        s.abbr.toLowerCase().includes(stateSearch.toLowerCase())
    ),
    [stateSearch]
  );

  const availableCities = useMemo(
    () => usState ? US_CITIES.filter((c) => c.stateAbbr === usState) : [],
    [usState]
  );

  const filteredCities = useMemo(
    () => availableCities.filter(
      (c) =>
        c.en.toLowerCase().includes(citySearch.toLowerCase()) ||
        c.he.includes(citySearch)
    ),
    [availableCities, citySearch]
  );

  const switchMode = (m: LocationMode) => {
    setMode(m);
    setUsState("");
    setCountry(m === "usa" ? 'ארה"ב' : "");
    setCity("");
    setStateOpen(false);
    setCityOpen(false);
    setCountryOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Toggle: USA / Outside USA */}
      <div>
        <label className="text-sm text-gray-600 font-medium block text-right mb-2">מיקום</label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl" dir="ltr">
          <button
            type="button"
            onClick={() => switchMode("world")}
            className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === "world"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400"
            }`}
          >
            🌍 מחוץ לארה״ב
          </button>
          <button
            type="button"
            onClick={() => switchMode("usa")}
            className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === "usa"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400"
            }`}
          >
            🇺🇸 בתוך ארה״ב
          </button>
        </div>
      </div>

      {/* ── USA MODE ── */}
      {mode === "usa" && (
        <>
          {/* State picker */}
          <div>
            <label className="text-sm text-gray-600 font-medium block text-right mb-1">מדינה (State)</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setStateOpen((v) => !v); setCityOpen(false); }}
                className="w-full h-11 border border-gray-300 rounded-xl px-3 flex items-center justify-between bg-white focus:border-blue-500"
              >
                <ChevronDown size={16} className={`text-gray-400 transition-transform shrink-0 ${stateOpen ? "rotate-180" : ""}`} />
                <span className={`text-sm flex-1 text-right mr-2 ${selectedState ? "text-gray-900 font-medium" : "text-gray-300"}`}>
                  {selectedState ? `${selectedState.he} (${selectedState.abbr})` : "בחר מדינה..."}
                </span>
              </button>

              {stateOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setStateOpen(false)} />
                  <div className="absolute top-12 right-0 left-0 z-40 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-3 pt-3 pb-2 border-b border-gray-100">
                      <div className="relative">
                        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={stateSearch}
                          onChange={(e) => setStateSearch(e.target.value)}
                          placeholder="חיפוש מדינה..."
                          autoFocus
                          className="w-full h-9 bg-gray-100 rounded-xl pr-8 pl-3 text-right text-sm outline-none placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {filteredStates.map((s) => (
                        <button
                          key={s.abbr}
                          type="button"
                          onClick={() => {
                            setUsState(s.abbr);
                            setCountry("ארה\"ב");
                            setCity("");
                            setStateOpen(false);
                            setStateSearch("");
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 active:bg-gray-50 ${usState === s.abbr ? "bg-blue-50" : ""}`}
                        >
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${usState === s.abbr ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-500"}`}>
                            {s.abbr}
                          </span>
                          <span className="text-sm text-right flex-1 mx-3">
                            <span className={`font-semibold ${usState === s.abbr ? "text-blue-700" : "text-gray-800"}`}>{s.he}</span>
                            <span className="text-gray-400 mr-1"> {s.en}</span>
                          </span>
                          {usState === s.abbr && <span className="text-blue-600">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* City picker (USA) */}
          <div>
            <label className="text-sm text-gray-600 font-medium block text-right mb-1">עיר</label>
            <div className="relative">
              <button
                type="button"
                disabled={!usState}
                onClick={() => { setCityOpen((v) => !v); setStateOpen(false); }}
                className={`w-full h-11 border rounded-xl px-3 flex items-center justify-between bg-white ${!usState ? "border-gray-200 opacity-50 cursor-not-allowed" : "border-gray-300"}`}
              >
                <ChevronDown size={16} className={`text-gray-400 transition-transform shrink-0 ${cityOpen ? "rotate-180" : ""}`} />
                <span className={`text-sm flex-1 text-right mr-2 ${city ? "text-gray-900 font-medium" : "text-gray-300"}`}>
                  {!usState ? "בחר מדינה תחילה" : city || "בחר עיר..."}
                </span>
              </button>

              {cityOpen && usState && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setCityOpen(false)} />
                  <div className="absolute top-12 right-0 left-0 z-40 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-3 pt-3 pb-2 border-b border-gray-100">
                      <div className="relative">
                        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          placeholder="חיפוש עיר..."
                          autoFocus
                          className="w-full h-9 bg-gray-100 rounded-xl pr-8 pl-3 text-right text-sm outline-none placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {filteredCities.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">אין ערים להצגה</p>
                      ) : filteredCities.map((c) => (
                        <button
                          key={c.en}
                          type="button"
                          onClick={() => {
                            setCity(c.he);
                            setCityOpen(false);
                            setCitySearch("");
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 active:bg-gray-50 ${city === c.he ? "bg-gray-50" : ""}`}
                        >
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">{c.stateAbbr}</span>
                          <span className="text-sm text-right flex-1 mx-3">
                            <span className={`font-semibold ${city === c.he ? "text-gray-900" : "text-gray-800"}`}>{c.he}</span>
                            <span className="text-gray-400 mr-1"> {c.en}</span>
                          </span>
                          {city === c.he && <span className="text-gray-700">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* מחוץ לארה"ב — אין שדות נוספים */}
    </div>
  );
}
