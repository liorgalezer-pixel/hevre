"use client";

import { MessageCircle, Bell, Search, SlidersHorizontal, MapPin, DollarSign, Clock, Heart, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { CATEGORIES } from "@/lib/categories";
import { MOCK_JOBS } from "@/lib/mock-jobs";
import { STORAGE_KEYS } from "@/lib/storage-keys";

type Filters = {
  categories: string[];
  states: string[];
  cities: string[];
  fromTime: string;
  toTime: string;
  license: boolean;
  car: boolean;
  weekend: boolean;
  holidays: boolean;
};

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<Filters | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.FILTERS);
    if (stored) {
      try { setFilters(JSON.parse(stored)); } catch {}
    }
  }, []);

  const clearFilters = () => {
    localStorage.removeItem(STORAGE_KEYS.FILTERS);
    setFilters(null);
  };

  const hasActiveFilters = filters && (
    filters.categories.length > 0 ||
    filters.states.length > 0 ||
    filters.cities.length > 0 ||
    filters.license || filters.car || filters.weekend || filters.holidays
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-10 pb-3 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <button onClick={() => router.push("/messages")} className="relative w-11 h-11 flex items-center justify-center">
              <MessageCircle size={26} className="text-gray-700" strokeWidth={1.8} />
            </button>
            <div ref={bellRef} className="relative">
              <button onClick={() => setBellOpen((v) => !v)} className="w-11 h-11 flex items-center justify-center">
                <Bell size={26} className="text-gray-700" strokeWidth={1.8} />
              </button>
              {bellOpen && (
                <div className="absolute top-12 right-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 w-72 p-4 flex flex-col gap-2" dir="rtl">
                  <p className="text-sm font-bold text-gray-700 mb-1">התראות</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <p className="bg-gray-50 rounded-xl px-3 py-2.5">אין הודעות חדשות כרגע</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Image src="/hevre-logo.png" alt="Hevre" width={100} height={40} className="object-contain" priority />
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש משרה..."
              className="w-full bg-gray-100 rounded-xl h-11 pr-9 pl-3 text-right text-sm outline-none placeholder:text-gray-400 text-gray-800"
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => router.push("/filter")} className={`relative rounded-xl px-4 h-11 flex items-center gap-1.5 font-semibold text-sm active:bg-blue-800 ${hasActiveFilters ? "bg-blue-900" : "bg-blue-700"} text-white`}>
              <SlidersHorizontal size={15} />
              סנן
              {hasActiveFilters && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-400 rounded-full text-[10px] font-black flex items-center justify-center">
                  {[filters!.categories.length, filters!.states.length, filters!.cities.length, filters!.license ? 1 : 0, filters!.car ? 1 : 0, filters!.weekend ? 1 : 0, filters!.holidays ? 1 : 0].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 active:bg-red-100">
                <X size={18} className="text-red-500" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="bg-white border-b border-gray-100 px-3 py-3">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(activeCategory === id ? null : id)}
              className={`flex flex-col items-center justify-center gap-1.5 min-w-[76px] h-[78px] rounded-2xl border shrink-0 transition-colors ${
                activeCategory === id ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
              }`}
            >
              <Icon size={26} className={activeCategory === id ? "text-blue-700" : "text-gray-600"} strokeWidth={1.5} />
              <span className={`text-xs font-medium ${activeCategory === id ? "text-blue-700" : "text-gray-700"}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>


      {/* Jobs */}
      <main className="flex-1 px-3 py-4 pb-24 flex flex-col gap-3">
        {(() => {
          const filtered = MOCK_JOBS.filter(j => {
            if (activeCategory && !j.categories.includes(activeCategory)) return false;
            if (filters) {
              if (filters.categories.length > 0 && !filters.categories.some(c => j.categories.includes(c))) return false;
              if (filters.cities.length > 0 && !filters.cities.some(city => j.location.toLowerCase().includes(city.toLowerCase()))) return false;
              if (filters.license && !j.license) return false;
              if (filters.car && !j.car) return false;
            }
            return true;
          });
          return (
            <>
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-900">
                  {activeCategory ? CATEGORIES.find(c => c.id === activeCategory)?.label : 'משרות ארה"ב'}
                </h1>
                <p className="text-sm text-gray-500">{filtered.length} משרות פתוחות</p>
              </div>

              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <span className="text-4xl">🔍</span>
                  <p className="text-gray-400 text-sm">אין משרות בקטגוריה זו כרגע</p>
                </div>
              )}

              {filtered.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3" style={{ direction: "ltr" }}>
              <button className="w-9 h-9 flex items-center justify-center rounded-full shrink-0">
                <Heart size={20} className="text-gray-300" strokeWidth={1.8} />
              </button>
              <div className="flex-1 text-right">
                <h2 className="text-base font-black text-gray-900 leading-snug">{job.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-lg font-black text-blue-700">
                {job.company[0]}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-start" dir="rtl">
              <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                <DollarSign size={11} strokeWidth={2} />{job.salary}
              </span>
              <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                <MapPin size={11} strokeWidth={2} />{job.location}
              </span>
              <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                <Clock size={11} strokeWidth={2} />{job.hours}
              </span>
              {job.car && <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">🚗 כולל רכב</span>}
              {job.license && <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">🪪 דרוש רישיון</span>}
            </div>

            <button
              onClick={() => router.push(`/jobs/${job.id}/view`)}
              className="w-full h-12 bg-blue-700 text-white font-bold text-sm rounded-xl active:bg-blue-800 transition-colors"
            >
              צפה במשרה
            </button>
          </div>
              ))}
            </>
          );
        })()}
      </main>

      <BottomNav />
    </div>
  );
}
