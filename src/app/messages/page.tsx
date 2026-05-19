"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";



export default function MessagesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">צ׳אט</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>

      {/* Empty state */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-24 text-center">
        <div className="text-6xl mb-6">💬</div>
        <h2 className="text-xl font-black text-gray-900 mb-3">אין צ׳אטים עדיין</h2>
        <p className="text-base text-gray-400 leading-relaxed">
          ברגע שעסק יקבל את המועמדות שלך תפתח פה צ׳אט
        </p>
      </main>

    </div>
  );
}
