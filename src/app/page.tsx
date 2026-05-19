"use client";

import { MessageCircle, Bell, Search, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { CATEGORIES } from "@/lib/categories";

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
          <button onClick={() => router.push("/filter")} className="bg-blue-700 text-white rounded-xl px-4 h-11 flex items-center gap-1.5 font-semibold text-sm shrink-0 active:bg-blue-800">
            <SlidersHorizontal size={15} />
            סנן
          </button>
        </div>
      </header>

      {/* Categories */}
      <div className="bg-white border-b border-gray-100 px-3 py-3">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => setActiveCategory(activeCategory === label ? null : label)}
              className={`flex flex-col items-center justify-center gap-1.5 min-w-[76px] h-[78px] rounded-2xl border shrink-0 transition-colors ${
                activeCategory === label ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
              }`}
            >
              <Icon size={26} className={activeCategory === label ? "text-blue-700" : "text-gray-600"} strokeWidth={1.5} />
              <span className={`text-xs font-medium ${activeCategory === label ? "text-blue-700" : "text-gray-700"}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Jobs */}
      <main className="flex-1 px-3 py-4 pb-24 flex flex-col gap-3">
        <div className="text-right">
          <h1 className="text-xl font-bold text-gray-900">משרות ארה&quot;ב</h1>
          <p className="text-sm text-gray-500">140 משרות פתוחות בארה&quot;ב</p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Search size={32} className="text-blue-700" strokeWidth={1.5} />
          </div>
          <p className="text-gray-500 text-sm">אין משרות להצגה כרגע</p>
          <p className="text-gray-400 text-xs mt-1">נסה לשנות את הפילטרים</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
