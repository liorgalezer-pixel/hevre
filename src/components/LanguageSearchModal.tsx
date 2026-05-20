"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Check } from "lucide-react";

const ALL_LANGUAGES = [
  "עברית", "אנגלית", "ערבית", "ספרדית", "צרפתית", "פורטוגזית", "רוסית",
  "גרמנית", "איטלקית", "יידיש", "אמהרית", "טיגרינית", "רומנית", "הונגרית",
  "פולנית", "אוקראינית", "תורכית", "פרסית", "הינדי", "סינית", "יפנית",
  "קוריאנית", "תאית", "וייטנאמית", "אינדונזית", "מלאית", "סווהילי",
  "הולנדית", "שוודית", "נורבגית", "דנית", "פינית", "יוונית", "צ'כית",
  "סלובקית", "קרואטית", "סרבית", "בולגרית", "קטלנית", "עברית (מרוקאית)",
  "ג'ורג'ית", "ארמנית", "אזרית", "קזחית", "אוזבקית", "בנגלית",
];

type Props = {
  selected: string[];
  onAdd: (lang: string) => void;
  onClose: () => void;
};

export default function LanguageSearchModal({ selected, onAdd, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = ALL_LANGUAGES.filter(l =>
    l.toLowerCase().includes(query.toLowerCase()) && !selected.includes(l)
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full px-4 pt-5 pb-10 flex flex-col gap-3 max-h-[70vh]">
          <div className="flex items-center justify-between mb-1">
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
              <X size={18} className="text-gray-600" strokeWidth={2} />
            </button>
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
            <div className="w-9" />
          </div>

          <h2 className="text-base font-black text-gray-900 text-center">בחר שפה</h2>

          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-11">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="חפש שפה..."
              dir="rtl"
              className="flex-1 bg-transparent text-sm text-right outline-none"
            />
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">לא נמצאה שפה</p>
            )}
            {filtered.map(lang => (
              <button
                key={lang}
                onClick={() => { onAdd(lang); onClose(); }}
                className="flex items-center justify-between px-2 py-3 border-b border-gray-100 active:bg-gray-50 text-right"
              >
                <Check size={16} className="text-gray-200 shrink-0" />
                <span className="text-sm text-gray-800">{lang}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
