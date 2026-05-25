"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterDetailsPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
      if (fullName) {
        const parts = fullName.trim().split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
    });
  }, []);

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-cream px-5 pt-14 pb-10" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronLeft size={24} className="text-ink-2" strokeWidth={2} />
        </button>
      </div>

      {/* Title */}
      <h1 className="font-serif text-2xl font-bold text-ink tracking-tight text-right mb-8">הצטרף ל-Hevre</h1>

      {/* Form */}
      <div className="flex flex-col gap-5 flex-1">

        {/* First name */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">שם פרטי</label>
          <div className="h-14 bg-paper ring-1 ring-divider rounded-2xl flex items-center px-4 focus-within:ring-terracotta transition-colors">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="ישראל"
              className="flex-1 text-right text-base outline-none bg-transparent text-ink placeholder:text-ink-3"
            />
          </div>
        </div>

        {/* Last name */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">שם משפחה</label>
          <div className="h-14 bg-paper ring-1 ring-divider rounded-2xl flex items-center px-4 focus-within:ring-terracotta transition-colors">
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="ישראלי"
              className="flex-1 text-right text-base outline-none bg-transparent text-ink placeholder:text-ink-3"
            />
          </div>
        </div>
      </div>

      {/* Continue button */}
      <div className="pt-6">
        <button
          disabled={!isValid}
          onClick={() => {
            if (!isValid) return;
            localStorage.setItem("reg_first_name", firstName);
            localStorage.setItem("reg_last_name", lastName);
            router.push("/register/about");
          }}
          className={`w-full h-14 font-serif font-semibold text-base rounded-2xl transition-opacity text-cream ${isValid ? "bg-terracotta active:opacity-90" : "bg-ink-3 opacity-40"}`}
        >
          המשך
        </button>
      </div>
    </div>
  );
}
