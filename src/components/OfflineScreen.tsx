"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineScreen() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-cream flex flex-col items-center justify-center px-8 gap-6" dir="rtl">
      <div className="w-16 h-16 rounded-full bg-cream-warm flex items-center justify-center">
        <WifiOff size={32} className="text-ink-3" strokeWidth={1.5} />
      </div>
      <div className="text-center flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">אין חיבור לאינטרנט</h1>
        <p className="text-sm text-ink-3">בדוק את החיבור שלך ונסה שוב</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="h-14 px-10 bg-terracotta text-cream font-serif font-semibold text-base rounded-2xl active:opacity-80 transition-opacity"
      >
        נסה שוב
      </button>
    </div>
  );
}
