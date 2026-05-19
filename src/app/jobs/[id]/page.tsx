"use client";

import { useState, useEffect, use } from "react";
import { ChevronRight, Search, Globe, Building2, DollarSign, Clock, IdCard, Car, BedDouble, MessageCircle, Pencil, Snowflake, Share2, Trash2, Eye, Heart, Users, X, PlayCircle, Home, PlusCircle, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/storage-keys";

type Job = {
  id: string;
  title: string;
  salary: string;
  companyAddress: string;
  categories: string[];
  logoPreview: string | null;
  active: boolean;
  weekend: boolean;
  holidays: boolean;
  license: boolean;
  car: boolean;
  housing: boolean;
  startTime: string;
  endTime: string;
  createdAt: string;
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmFreeze, setConfirmFreeze] = useState(false);
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    const stored: Job[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MY_JOBS) || "[]");
    const found = stored.find((j) => j.id === id);
    if (found) {
      setJob(found);
      setFrozen(!!(found as Job & { frozen?: boolean }).frozen);
    }
  }, [id]);

  const updateJob = (updates: Partial<Job & { frozen?: boolean }>) => {
    const stored: (Job & { frozen?: boolean })[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MY_JOBS) || "[]");
    const updated = stored.map((j) => j.id === id ? { ...j, ...updates } : j);
    localStorage.setItem(STORAGE_KEYS.MY_JOBS, JSON.stringify(updated));
  };

  const handleFreeze = () => {
    setFrozen(true);
    updateJob({ frozen: true });
    setConfirmFreeze(false);
  };

  const handleUnfreeze = () => {
    setFrozen(false);
    updateJob({ frozen: false });
  };

  const handleRemove = () => {
    const stored: Job[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MY_JOBS) || "[]");
    localStorage.setItem(STORAGE_KEYS.MY_JOBS, JSON.stringify(stored.filter((j) => j.id !== id)));
    router.push("/my-jobs");
  };

  if (!job) return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4" dir="rtl">
      <p className="text-gray-500 text-base">המשרה לא נמצאה</p>
      <button onClick={() => router.push("/my-jobs")} className="text-blue-700 font-bold">חזרה למודעות שלי</button>
    </div>
  );

  const createdDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString("he-IL") : "";

  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-3 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.push("/my-jobs")} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
        <button className="w-11 h-11 flex items-center justify-center">
          <Search size={22} className="text-gray-700" strokeWidth={1.8} />
        </button>
      </header>

      {/* Yellow promo banner */}
      {bannerVisible && (
        <div className="bg-yellow-400 px-4 py-4 flex items-center gap-3" style={{ direction: "ltr" }}>
          <button onClick={() => setBannerVisible(false)} className="shrink-0">
            <X size={18} className="text-yellow-800" strokeWidth={2} />
          </button>
          <div className="flex flex-1 items-center justify-between gap-2">
            <span className="text-2xl">🔧</span>
            <p className="text-sm font-bold text-yellow-900 text-right flex-1 leading-snug">
              פרסמת עבודה אחת בחינם,<br />ניתן לפרסם עוד עבודה ללא עלות
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 pt-5 pb-44 flex flex-col gap-4">

        {/* Title + logo */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            {job.logoPreview ? (
              <Image src={job.logoPreview} alt="לוגו" width={48} height={48} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-black text-gray-400">H</span>
            )}
          </div>
          <h1 className="text-xl font-black text-gray-900 text-right leading-snug flex-1">{job.title}</h1>
        </div>

        {/* Status tags */}
        <div className="flex gap-2 justify-end">
          <span className="flex items-center gap-1.5 text-sm font-medium text-white bg-gray-700 rounded-lg px-3 py-1">
            <span className={`w-2 h-2 rounded-full inline-block ${frozen ? "bg-red-400" : "bg-green-400"}`} />
            {frozen ? "קפוא" : "פעיל"}
          </span>
          <span className="text-sm font-medium text-white bg-gray-700 rounded-lg px-3 py-1">
            מודעה בסיסית
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2.5 mt-1">
          {[
            { icon: Globe, label: "מדינה", text: "ארצות הברית" },
            { icon: Building2, label: "עיר", text: job.companyAddress || "לא צוין" },
            { icon: DollarSign, label: "שכר", text: job.salary || "תחרותי בהתאם לניסיון" },
            { icon: Clock, label: "שעות עבודה", text: `${job.startTime || "08:00"} - ${job.endTime || "18:00"}` },
            { icon: IdCard, label: "חובה רישיון", text: job.license ? "כן" : "לא" },
            { icon: Car, label: "מספק רכב", text: job.car ? "כן" : "לא" },
            { icon: BedDouble, label: "מספק דיור", text: job.housing ? "כן" : "לא" },
          ].map(({ icon: Icon, label, text }, i) => (
            <div key={i} className="flex items-center gap-2" style={{ direction: "ltr" }}>
              <span className="text-sm text-gray-500 flex-1 text-left">{text}</span>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-700 font-medium">{label}</span>
              <Icon size={18} className="text-gray-500 shrink-0" strokeWidth={1.6} />
            </div>
          ))}
        </div>

        {/* Chat row */}
        <div className="flex items-center justify-between border-t border-b border-gray-100 py-3 mt-1" style={{ direction: "ltr" }}>
          <button onClick={() => router.push("/messages")} className="text-yellow-500 font-bold text-base active:opacity-70">לצ׳אט</button>
          <div className="flex items-center gap-2">
            <MessageCircle size={24} className="text-gray-700" strokeWidth={1.6} />
            <span className="text-sm text-gray-600">יש לך 0 הודעות</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between mt-1">
          {[
            { icon: Pencil, label: "עריכה", action: () => router.push(`/jobs/${id}/edit`) },
            { icon: frozen ? PlayCircle : Snowflake, label: frozen ? "החזרה לפעילות" : "הקפאה", action: () => frozen ? handleUnfreeze() : setConfirmFreeze(true) },
            { icon: Share2, label: "שיתוף", action: () => {} },
            { icon: Trash2, label: "הסרה", action: () => setConfirmRemove(true) },
          ].map(({ icon: Icon, label, action }) => (
            <button key={label} onClick={action} className="flex flex-col items-center gap-1.5 active:opacity-60">
              <Icon size={24} className={label === "הסרה" ? "text-red-400" : "text-gray-700"} strokeWidth={1.6} />
              <span className={`text-xs font-medium ${label === "הסרה" ? "text-red-400" : "text-gray-600"}`}>{label}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-between mt-2 border-t border-gray-100 pt-4">
          {[
            { icon: Eye, label: "צפו במודעה", value: "0" },
            { icon: Heart, label: "שהבתי את המודעה", value: "0" },
            { icon: Users, label: "השאירו מועמדות", value: "0" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon size={22} className="text-gray-500" strokeWidth={1.6} />
              <span className="text-base font-bold text-gray-800">{value}</span>
              <span className="text-[10px] text-gray-400 text-center leading-tight max-w-[70px]">{label}</span>
            </div>
          ))}
        </div>

        {/* Meta */}
        <div className="text-right text-sm text-gray-400 mt-1 flex flex-col gap-0.5">
          {createdDate && <p>מועד יצירה: {createdDate}</p>}
          <p>מספר מודעה: {job.id}</p>
        </div>

      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 right-0 left-0 z-50 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around h-16">
          {[
            { href: "/profile", icon: User, label: "אזור אישי" },
            { href: "/saved", icon: Heart, label: "אהבתי" },
            { href: "/post?new=1", icon: PlusCircle, label: "פרסום" },
            { href: "/search", icon: Search, label: "חיפוש" },
            { href: "/", icon: Home, label: "דף הבית" },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex flex-col items-center justify-center flex-1 h-full gap-0.5">
              <Icon size={24} className="text-gray-400" strokeWidth={1.8} />
              <span className="text-[10px] font-medium text-gray-400">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Upgrade button */}
      <div className="fixed bottom-16 right-0 left-0 bg-white border-t border-gray-100 px-4 py-4">
        <button onClick={() => router.push("/upgrade")} className="w-full h-14 bg-yellow-400 text-white font-black text-xl rounded-2xl active:bg-yellow-500 transition-colors">
          שדרוג
        </button>
      </div>

      {/* Confirm freeze modal */}
      {confirmFreeze && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setConfirmFreeze(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-3xl w-full px-6 py-7 flex flex-col gap-5">
              <h2 className="text-lg font-bold text-gray-900 text-center">הקפאת מודעה</h2>
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                אתה בטוח שתרצה להקפיא פרסום מודעה זו?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmFreeze(false)} className="flex-1 h-12 rounded-2xl border border-gray-300 text-gray-700 font-medium">לא</button>
                <button
                  onClick={handleFreeze}
                  className="flex-1 h-12 rounded-2xl bg-blue-700 text-white font-bold active:bg-blue-800"
                >
                  כן
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirm remove modal */}
      {confirmRemove && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setConfirmRemove(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-3xl w-full px-6 py-7 flex flex-col gap-5">
              <h2 className="text-lg font-bold text-gray-900 text-center">הסרת מודעה</h2>
              <p className="text-sm text-gray-500 text-center">האם אתה בטוח שברצונך להסיר את המודעה?</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmRemove(false)} className="flex-1 h-12 rounded-2xl border border-gray-300 text-gray-700 font-medium">ביטול</button>
                <button onClick={handleRemove} className="flex-1 h-12 rounded-2xl bg-red-500 text-white font-bold active:bg-red-600">כן, הסר</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
