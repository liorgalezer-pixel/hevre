"use client";

import { ChevronRight, Search, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const mockSaved: never[] = [];

export default function SavedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-3">
        <div className="flex items-center justify-between mb-4">
          <Link href="/profile" className="w-11 h-11 flex items-center justify-center">
            <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
          </Link>
          <Image src="/hevre-logo.png" alt="Hevre" width={90} height={36} className="object-contain" />
        </div>

        {/* Search bar */}
        <div className="flex items-center bg-gray-100 rounded-2xl h-12 px-4 gap-3">
          <Search size={18} className="text-gray-400 shrink-0" strokeWidth={1.6} />
          <input
            type="text"
            placeholder="חיפוש משרה..."
            dir="rtl"
            className="flex-1 text-right text-sm outline-none bg-transparent placeholder:text-gray-400"
          />
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-28">

        {/* Section title */}
        <div className="flex items-center justify-between mb-4">
          <button className="text-gray-400">
            <span className="text-lg">&gt;</span>
          </button>
          <h2 className="text-xl font-black text-gray-900">מודעות שאהבתי</h2>
        </div>

        {mockSaved.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="mb-6">
              <Heart size={72} className="text-blue-700" strokeWidth={1.2} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">עדיין לא אהבת משרה</h3>
            <p className="text-gray-400 text-base leading-relaxed">כשתמצא משהו מעניין לחץ על הלב<br />והמשרה תישמר כאן</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4" />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
