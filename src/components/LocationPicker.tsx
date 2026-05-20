"use client";

import { useState, useMemo, useCallback } from "react";
import { X, ChevronDown } from "lucide-react";
import { US_STATES, US_CITIES, getCitiesForStates } from "@/lib/us-locations";

type Props = {
  selectedStates: string[];
  selectedCities: string[];
  onStatesChange: (states: string[]) => void;
  onCitiesChange: (cities: string[]) => void;
};

const cityKey = (c: { en: string; stateAbbr: string }) => `${c.en} (${c.stateAbbr})`;

export default function LocationPicker({ selectedStates, selectedCities, onStatesChange, onCitiesChange }: Props) {
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const filteredStates = useMemo(
    () => US_STATES.filter(
      (s) =>
        s.en.toLowerCase().includes(stateSearch.toLowerCase()) ||
        s.he.includes(stateSearch) ||
        s.abbr.toLowerCase().includes(stateSearch.toLowerCase())
    ),
    [stateSearch]
  );

  const availableCities = useMemo(() => getCitiesForStates(selectedStates), [selectedStates]);

  const filteredCities = useMemo(
    () => availableCities.filter(
      (c) =>
        c.en.toLowerCase().includes(citySearch.toLowerCase()) ||
        c.he.includes(citySearch)
    ),
    [availableCities, citySearch]
  );

  const toggleState = useCallback((abbr: string) => {
    const next = selectedStates.includes(abbr)
      ? selectedStates.filter((s) => s !== abbr)
      : [...selectedStates, abbr];
    onStatesChange(next);
    onCitiesChange(selectedCities.filter((city) => {
      const c = US_CITIES.find((u) => cityKey(u) === city);
      return c && next.includes(c.stateAbbr);
    }));
  }, [selectedStates, selectedCities, onStatesChange, onCitiesChange]);

  const toggleCity = useCallback((key: string) => {
    onCitiesChange(
      selectedCities.includes(key)
        ? selectedCities.filter((c) => c !== key)
        : [...selectedCities, key]
    );
  }, [selectedCities, onCitiesChange]);

  const openStateDropdown = useCallback(() => { setStateOpen((v) => !v); setCityOpen(false); }, []);
  const openCityDropdown = useCallback(() => { setCityOpen((v) => !v); setStateOpen(false); }, []);

  return (
    <div className="flex flex-col gap-4">

      {/* ── STATE SELECTOR ── */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-gray-500 text-right">מדינה</p>

        {selectedStates.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedStates.map((abbr) => {
              const s = US_STATES.find((x) => x.abbr === abbr);
              if (!s) return null;
              return (
                <span key={abbr} className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  {s.he} {s.en}
                  <button onClick={() => toggleState(abbr)} className="ml-0.5">
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        <button
          onClick={openStateDropdown}
          className="w-full h-12 border border-gray-200 rounded-2xl px-4 flex items-center justify-between bg-white active:bg-gray-50"
          style={{ direction: "ltr" }}
        >
          <ChevronDown size={18} className={`text-gray-400 transition-transform ${stateOpen ? "rotate-180" : ""}`} strokeWidth={2} />
          <span className="text-sm text-gray-400">{selectedStates.length > 0 ? `${selectedStates.length} מדינות נבחרו` : "בחר מדינה"}</span>
        </button>

        {stateOpen && (
          <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-lg">
            <div className="px-3 pt-3 pb-2">
              <input
                type="text"
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                placeholder="חיפוש מדינה"
                className="w-full h-10 bg-gray-100 rounded-xl px-3 text-right text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filteredStates.map((s) => {
                const active = selectedStates.includes(s.abbr);
                return (
                  <button
                    key={s.abbr}
                    onClick={() => toggleState(s.abbr)}
                    className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 active:bg-gray-50 ${active ? "bg-blue-50" : ""}`}
                  >
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {s.abbr}
                    </span>
                    <span className="text-sm text-right flex-1 mx-3">
                      <span className={`font-semibold ${active ? "text-blue-700" : "text-gray-800"}`}>{s.he}</span>
                      <span className="text-gray-400 mr-1"> {s.en}</span>
                    </span>
                    {active && <span className="text-blue-600 text-sm">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── CITY SELECTOR ── */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-gray-500 text-right">עיר</p>

        {selectedCities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCities.map((key) => (
              <span key={key} className="flex items-center gap-1.5 bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                {key}
                <button onClick={() => toggleCity(key)}>
                  <X size={12} strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>
        )}

        <button
          onClick={openCityDropdown}
          className={`w-full h-12 border rounded-2xl px-4 flex items-center justify-between bg-white ${selectedStates.length === 0 ? "border-gray-100 opacity-50 cursor-not-allowed" : "border-gray-200 active:bg-gray-50"}`}
          disabled={selectedStates.length === 0}
          style={{ direction: "ltr" }}
        >
          <ChevronDown size={18} className={`text-gray-400 transition-transform ${cityOpen ? "rotate-180" : ""}`} strokeWidth={2} />
          <span className="text-sm text-gray-400">
            {selectedStates.length === 0 ? "בחר מדינה תחילה" : selectedCities.length > 0 ? `${selectedCities.length} ערים נבחרו` : "בחר עיר"}
          </span>
        </button>

        {cityOpen && selectedStates.length > 0 && (
          <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-lg">
            <div className="px-3 pt-3 pb-2">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="חיפוש עיר"
                className="w-full h-10 bg-gray-100 rounded-xl px-3 text-right text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filteredCities.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">אין ערים להצגה</p>
              ) : filteredCities.map((c) => {
                const key = cityKey(c);
                const active = selectedCities.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleCity(key)}
                    className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 active:bg-gray-50 ${active ? "bg-gray-50" : ""}`}
                  >
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {c.stateAbbr}
                    </span>
                    <span className="text-sm text-right flex-1 mx-3">
                      <span className={`font-semibold ${active ? "text-gray-900" : "text-gray-800"}`}>{c.he}</span>
                      <span className="text-gray-400 mr-1"> {c.en}</span>
                    </span>
                    {active && <span className="text-gray-700 text-sm">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
