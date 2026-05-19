"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

export default function MessagesPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  if (isLoggedIn === null) return null;

  if (!isLoggedIn) return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">הודעות</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5 pb-24">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-black text-gray-900">יש להתחבר כדי לצפות בהודעות</h2>
        <p className="text-sm text-gray-400">התחבר או צור חשבון כדי לנהל את ההודעות שלך</p>
        <Link href="/login" className="w-full h-14 bg-blue-700 text-white font-bold text-base rounded-2xl flex items-center justify-center active:bg-blue-800 transition-colors">
          התחבר / הרשם
        </Link>
      </main>
      <BottomNav />
    </div>
  );

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

      <BottomNav />
    </div>
  );
}
