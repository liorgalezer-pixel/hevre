"use client";

import { useEffect, useState, useCallback } from "react";
import { WifiOff } from "lucide-react";

async function checkOnline(): Promise<boolean> {
  if (!navigator.onLine) return false;
  try {
    await fetch("/api/ping", { method: "HEAD", cache: "no-store" });
    return true;
  } catch {
    return false;
  }
}

export default function OfflineScreen() {
  const [isOffline, setIsOffline] = useState(false);

  const test = useCallback(async () => {
    const online = await checkOnline();
    setIsOffline(!online);
  }, []);

  useEffect(() => {
    test();
    const interval = setInterval(test, 3000);
    window.addEventListener("online", test);
    window.addEventListener("offline", test);
    return () => {
      clearInterval(interval);
      window.removeEventListener("online", test);
      window.removeEventListener("offline", test);
    };
  }, [test]);

  if (!isOffline) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-cream flex flex-col items-center justify-center px-8 gap-6"
      dir="rtl"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="w-16 h-16 rounded-full bg-cream-warm flex items-center justify-center">
        <WifiOff size={32} className="text-ink-3" strokeWidth={1.5} />
      </div>
      <div className="text-center flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">אין חיבור לאינטרנט</h1>
        <p className="text-sm text-ink-3">האפליקציה תתעדכן אוטומטית כשהחיבור יחזור</p>
      </div>
      <button
        onClick={async () => {
          const online = await checkOnline();
          if (online) { setIsOffline(false); window.location.reload(); }
        }}
        className="h-14 px-10 bg-terracotta text-cream font-serif font-semibold text-base rounded-2xl active:opacity-80 transition-opacity"
      >
        נסה שוב
      </button>
    </div>
  );
}
