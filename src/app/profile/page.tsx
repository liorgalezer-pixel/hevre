"use client";

import React, { useState, useEffect } from "react";
import { Camera, Monitor, FileCheck, Bell, Mail, ChevronLeft, HelpCircle, ScrollText, ShieldCheck, Star, Smile, Heart, Search, PlusCircle, LogOut, UserPen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BottomNav from "@/components/BottomNav";

const accountItems: { icon: React.ElementType; label: string; bold: boolean; href: string; todo?: boolean }[] = [
  { icon: Monitor, label: "המודעות שלי", bold: false, href: "/my-jobs" },
  { icon: FileCheck, label: "מועמדות שלי למשרות", bold: false, href: "/my-applications" },
  { icon: Heart, label: "משרות שמורות", bold: false, href: "/saved" },
  { icon: Bell, label: "התראות", bold: false, href: "/alerts" },
  { icon: Mail, label: "הודעות", bold: false, href: "/messages" },
  { icon: UserPen, label: "עדכון פרטים אישיים", bold: false, href: "/profile/edit" },
];


export default function ProfilePage() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setIsLoggedIn(true);
      const { data } = await supabase.from("profiles").select("first_name").eq("id", user.id).single();
      if (data?.first_name) setFirstName(data.first_name);
    };
    fetchProfile();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <div className="w-11" />
        <h1 className="text-lg font-bold text-gray-900">אזור אישי</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>

      <main className="flex-1 pb-24">

        {/* Profile hero */}
        <div className="bg-gray-100 flex flex-col items-center py-8 px-4">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-gray-300" />
            <button className="absolute bottom-1 right-1 w-9 h-9 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm">
              <Camera size={18} className="text-gray-600" strokeWidth={1.8} />
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {firstName ? `ברוך הבא, ${firstName}` : "ברוך הבא ל-Hevre"}
          </h2>
          {!isLoggedIn && (
            <Link href="/login" className="text-sm text-gray-500 active:text-blue-600">התחבר או הרשם לחשבון</Link>
          )}
        </div>

        {/* Account section */}
        <div className="px-4 mt-4">
          <p className="text-sm text-gray-400 text-right mb-2">חשבון Hevre</p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {accountItems.map(({ icon: Icon, label, bold, href, todo }, idx) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center justify-between px-4 py-4 active:bg-gray-50 ${
                  idx < accountItems.length - 1 ? "border-b border-gray-100" : ""
                }`}
                style={{ direction: "ltr" }}
              >
                <ChevronLeft size={18} className={`shrink-0 ${todo ? "text-red-300" : "text-gray-400"}`} />
                <span className={`flex-1 text-right text-base mr-3 ${bold ? "font-bold" : ""} ${todo ? "text-red-500" : "text-gray-800"}`}>
                  {label}
                </span>
                <Icon size={22} className={`shrink-0 ${todo ? "text-red-400" : "text-gray-700"}`} strokeWidth={1.6} />
              </Link>
            ))}

            {/* Login button */}
            {!isLoggedIn && (
              <div className="px-4 py-4">
                <Link href="/login" className="block w-full bg-blue-700 text-white font-bold text-base rounded-xl py-3.5 text-center active:bg-blue-800 transition-colors">
                  התחבר לחשבון
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Post job section */}
        <div className="px-4 mt-5">
          <p className="text-sm text-gray-400 text-right mb-2">פרסום משרה</p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <Link
              href="/post?new=1"
              className="flex items-center justify-between px-4 py-4 active:bg-gray-50"
              style={{ direction: "ltr" }}
            >
              <ChevronLeft size={18} className="text-gray-400 shrink-0" />
              <span className="flex-1 text-right text-base mr-3 text-gray-800">פרסם משרה חדשה</span>
              <PlusCircle size={22} className="text-gray-700 shrink-0" strokeWidth={1.6} />
            </Link>
          </div>
        </div>

        {/* Support section */}
        <div className="px-4 mt-5">
          <p className="text-sm text-gray-400 text-right mb-2">תמיכה</p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
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
                className={`flex items-center justify-between px-4 py-4 active:bg-gray-50 ${idx < arr.length - 1 ? "border-b border-gray-100" : ""}`}
                style={{ direction: "ltr" }}
              >
                <ChevronLeft size={18} className="text-gray-400 shrink-0" />
                <span className="flex-1 text-right text-base mr-3 text-gray-800">{label}</span>
                <Icon size={22} className="text-gray-700 shrink-0" strokeWidth={1.6} />
              </Link>
            ))}

            {/* Logout */}
            {isLoggedIn && (
              <button
                onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
                className="flex items-center justify-between px-4 py-4 w-full active:bg-red-50 border-t border-gray-100"
                style={{ direction: "ltr" }}
              >
                <ChevronLeft size={18} className="text-red-400 shrink-0" />
                <span className="flex-1 text-right text-base mr-3 text-red-500 font-semibold">התנתקות</span>
                <LogOut size={22} className="text-red-400 shrink-0" strokeWidth={1.6} />
              </button>
            )}
          </div>
        </div>

        {/* App version */}
        <p className="text-center text-xs text-gray-400 mt-6 mb-2">גרסת אפליקציה v.1.0.0</p>
      </main>

      <BottomNav />
    </div>
  );
}
