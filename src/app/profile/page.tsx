"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Monitor, FileCheck, Bell, Mail, ChevronLeft, HelpCircle, ScrollText, ShieldCheck, Star, Smile, Heart, PlusCircle, LogOut, UserPen, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BottomNav from "@/components/BottomNav";
import { usePostLimit } from "@/hooks/usePostLimit";

const accountItems: { icon: React.ElementType; label: string; bold: boolean; href: string; todo?: boolean }[] = [
  { icon: Monitor, label: "המודעות שלי", bold: false, href: "/my-jobs" },
  { icon: FileCheck, label: "מועמדות שלי למשרות", bold: false, href: "/my-applications" },
  { icon: Heart, label: "משרות שמורות", bold: false, href: "/saved" },
  { icon: Bell, label: "התראות", bold: false, href: "/alerts" },
  { icon: Mail, label: "הודעות", bold: false, href: "/messages" },
  { icon: UserPen, label: "עדכון פרטים אישיים", bold: false, href: "/profile/edit" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [photoSheet, setPhotoSheet] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { showLimitModal, setShowLimitModal, handlePostClick } = usePostLimit();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("התמונה גדולה מדי. גודל מקסימלי: 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("יש לבחור קובץ תמונה בלבד");
      return;
    }
    setPhotoSheet(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = data.publicUrl + "?t=" + Date.now();
    setAvatarUrl(url);
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (!user) return;
      const { data } = await supabase.from("profiles").select("first_name").eq("id", user.id).single();
      if (data?.first_name) setFirstName(data.first_name);
    };
    fetchProfile();
  }, []);

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider mr-1 mb-2 text-right">{children}</p>
  );

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      {/* Header */}
      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="w-11" />
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">אזור אישי</h1>
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
      </header>

      <main className="flex-1 pb-24">

        {/* Profile hero */}
        <div className="bg-cream flex flex-col items-center py-8 px-4">
          <div className="relative mb-4">
            <button onClick={() => setPhotoSheet(true)} className="w-28 h-28 rounded-full overflow-hidden bg-cream-warm ring-1 ring-divider block">
              {avatarUrl
                ? <Image src={avatarUrl} alt="תמונת פרופיל" width={112} height={112} className="w-full h-full object-cover" />
                : (
                  <div className="w-full h-full flex items-center justify-center font-serif text-4xl text-terracotta font-bold"
                       style={{ background: 'repeating-linear-gradient(135deg, #F5F1EA 0 8px, rgba(217,119,87,0.13) 8px 16px)' }}>
                    {firstName?.[0] || '?'}
                  </div>
                )
              }
            </button>
            <button onClick={() => setPhotoSheet(true)} className="absolute bottom-1 right-1 w-9 h-9 bg-paper rounded-full ring-1 ring-divider flex items-center justify-center shadow-sm">
              <Camera size={18} className="text-ink-2" strokeWidth={1.8} />
            </button>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelected} />
            <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelected} />
          </div>
          <h2 className="font-serif text-xl font-bold text-ink mb-1 tracking-tight">
            {firstName ? `ברוך הבא, ${firstName}` : "ברוך הבא ל-Hevre"}
          </h2>
          {isLoggedIn === false && (
            <Link href="/login" className="text-sm text-ink-2 active:text-terracotta">התחבר או הרשם לחשבון</Link>
          )}
        </div>

        {/* Account section */}
        <div className="px-4 mt-4">
          <SectionLabel>חשבון Hevre</SectionLabel>
          <div className="bg-paper rounded-2xl ring-1 ring-divider overflow-hidden">
            {accountItems.map(({ icon: Icon, label, bold, href, todo }, idx) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center justify-between px-4 py-4 active:bg-cream ${
                  idx < accountItems.length - 1 ? "border-b border-divider" : ""
                }`}
                style={{ direction: "ltr" }}
              >
                <ChevronLeft size={18} className={`shrink-0 ${todo ? "text-warm-danger" : "text-ink-3"}`} />
                <span className={`flex-1 text-right text-base mr-3 ${bold ? "font-semibold" : ""} ${todo ? "text-warm-danger" : "text-ink"}`}>
                  {label}
                </span>
                <Icon size={22} className={`shrink-0 ${todo ? "text-warm-danger" : "text-ink"}`} strokeWidth={1.6} />
              </Link>
            ))}

            {/* Login button */}
            {isLoggedIn === false && (
              <div className="px-4 py-4 border-t border-divider">
                <Link href="/login" className="block w-full bg-ink text-cream font-serif font-semibold text-base rounded-xl py-3.5 text-center active:opacity-90 transition-opacity">
                  התחבר לחשבון
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Post job section */}
        <div className="px-4 mt-5">
          <SectionLabel>פרסום משרה</SectionLabel>
          <div className="bg-paper rounded-2xl ring-1 ring-divider overflow-hidden">
            <button
              onClick={handlePostClick}
              className="w-full flex items-center justify-between px-4 py-4 active:bg-cream"
              style={{ direction: "ltr" }}
            >
              <ChevronLeft size={18} className="text-ink-3 shrink-0" />
              <span className="flex-1 text-right text-base mr-3 text-ink">פרסם משרה חדשה</span>
              <PlusCircle size={22} className="text-ink shrink-0" strokeWidth={1.6} />
            </button>
          </div>

          {/* Limit modal */}
          {showLimitModal && (
            <>
              <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setShowLimitModal(false)} />
              <div className="fixed inset-0 z-[70] flex items-end justify-center pb-8 px-5">
                <div className="bg-paper rounded-3xl w-full overflow-hidden shadow-2xl">
                  {/* Terracotta top strip */}
                  <div className="bg-terracotta px-6 pt-6 pb-8 flex flex-col items-center gap-3 relative">
                    <button onClick={() => setShowLimitModal(false)} className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 active:bg-white/30">
                      <X size={16} className="text-cream" strokeWidth={2.5} />
                    </button>
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                      ✦
                    </div>
                    <p className="font-serif text-xl font-bold text-cream tracking-tight text-center">Hevre+</p>
                  </div>
                  {/* Content */}
                  <div className="px-6 py-6 flex flex-col gap-4 -mt-4 bg-paper rounded-t-3xl">
                    <h2 className="font-serif text-lg font-bold text-ink text-center tracking-tight leading-snug">
                      הגעת למכסת המשרות החינמיות
                    </h2>
                    <p className="text-sm text-ink-2 text-center leading-relaxed">
                      בגרסה החינמית ניתן לפרסם עד 2 מודעות.<br />
                      שדרג ל-Hevre+ לפרסום ללא הגבלה.
                    </p>
                    <div className="flex flex-col gap-2 mt-1">
                      <button
                        onClick={() => { setShowLimitModal(false); router.push("/hevre-plus"); }}
                        className="w-full h-13 bg-terracotta text-cream font-serif font-semibold text-base rounded-2xl flex items-center justify-center py-3.5 active:opacity-90 transition-opacity"
                      >
                        שדרג ל-Hevre+ ✦
                      </button>
                      <button
                        onClick={() => setShowLimitModal(false)}
                        className="w-full h-12 text-ink-3 font-mono text-xs uppercase tracking-wider active:opacity-70"
                      >
                        אולי אחר כך
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Support section */}
        <div className="px-4 mt-5">
          <SectionLabel>תמיכה</SectionLabel>
          <div className="bg-paper rounded-2xl ring-1 ring-divider overflow-hidden">
            {[
              { icon: HelpCircle, label: "צור קשר", href: "/contact" },
              { icon: ScrollText, label: "תקנון", href: "/terms" },
              { icon: ShieldCheck, label: "מדיניות פרטיות", href: "/privacy" },
              { icon: Star, label: "דרגו אותנו", href: "/rate" },
              { icon: Smile, label: "משוב", href: "/feedback" },
            ].map(({ icon: Icon, label, href }, idx, arr) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center justify-between px-4 py-4 active:bg-cream ${idx < arr.length - 1 ? "border-b border-divider" : ""}`}
                style={{ direction: "ltr" }}
              >
                <ChevronLeft size={18} className="text-ink-3 shrink-0" />
                <span className="flex-1 text-right text-base mr-3 text-ink">{label}</span>
                <Icon size={22} className="text-ink shrink-0" strokeWidth={1.6} />
              </Link>
            ))}

            {/* Logout */}
            {isLoggedIn && (
              <button
                onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
                className="flex items-center justify-between px-4 py-4 w-full active:bg-warm-danger-bg border-t border-divider"
                style={{ direction: "ltr" }}
              >
                <ChevronLeft size={18} className="text-warm-danger shrink-0" />
                <span className="flex-1 text-right text-base mr-3 text-warm-danger font-semibold">התנתקות</span>
                <LogOut size={22} className="text-warm-danger shrink-0" strokeWidth={1.6} />
              </button>
            )}
          </div>
        </div>

        {/* App version */}
        <p className="text-center font-mono text-[10px] text-ink-3 mt-6 mb-2 tracking-wider uppercase">גרסת אפליקציה v.1.0.0</p>
      </main>

      <BottomNav />

      {/* Photo picker sheet */}
      {photoSheet && (
        <>
          <div className="fixed inset-0 bg-ink/40 z-40" onClick={() => setPhotoSheet(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-paper rounded-t-3xl px-5 pt-5 pb-10 flex flex-col gap-3" dir="rtl">
            <div className="w-10 h-1 bg-divider rounded-full mx-auto mb-2" />
            <p className="font-serif text-lg font-bold text-ink text-center mb-1 tracking-tight">בחר תמונת פרופיל</p>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl active:opacity-90 flex items-center justify-center gap-2"
            >
              <Camera size={20} strokeWidth={2} className="text-terracotta" />
              צלם תמונה
            </button>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full h-14 ring-1 ring-divider text-ink font-semibold text-base rounded-2xl active:bg-cream flex items-center justify-center gap-2"
            >
              🖼️ בחר מהגלריה
            </button>
          </div>
        </>
      )}
    </div>
  );
}
