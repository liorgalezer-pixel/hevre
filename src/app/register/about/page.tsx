"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterAboutPage() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const router = useRouter();

  const ageNum = parseInt(age);
  const ageValid = age.trim().length > 0 && ageNum >= 18 && ageNum <= 99;
  const isValid = ageValid && gender !== null;

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
      <div className="mb-8 text-right">
        <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">שנדע משהו עליך</h1>
        <p className="text-sm text-ink-2 mt-1">הפרטים האלה יעזרו למעסיקים להכיר אותך</p>
      </div>

      {/* Age */}
      <div className="flex flex-col gap-1.5 mb-5">
        <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">גיל</label>
        <div className={`h-14 bg-paper ring-1 rounded-2xl flex items-center px-4 focus-within:ring-terracotta transition-colors ${age && !ageValid ? "ring-warm-danger" : "ring-divider"}`}>
          <input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="25"
            min="18"
            max="99"
            className="flex-1 text-right text-base outline-none bg-transparent text-ink placeholder:text-ink-3"
          />
        </div>
        {age && ageNum < 18 && <p className="text-xs text-warm-danger text-right">גיל מינימלי להרשמה הוא 18</p>}
        {age && ageNum > 99 && <p className="text-xs text-warm-danger text-right">גיל מקסימלי להרשמה הוא 99</p>}
      </div>

      {/* Gender */}
      <div className="flex flex-col gap-1.5 mb-10">
        <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">מין</label>
        <div className="flex gap-3">
          {["זכר", "נקבה", "אחר"].map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`flex-1 h-12 rounded-2xl text-base font-semibold transition-colors ${
                gender === g
                  ? "bg-terracotta text-cream"
                  : "bg-paper ring-1 ring-divider text-ink active:bg-cream-warm"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <button
        disabled={!isValid}
        onClick={() => {
          if (!isValid) return;
          localStorage.setItem("reg_age", age);
          localStorage.setItem("reg_gender", gender!);
          router.push("/register/complete");
        }}
        className={`w-full h-14 font-serif font-semibold text-base rounded-2xl transition-opacity text-cream ${isValid ? "bg-terracotta active:opacity-90" : "bg-ink-3 opacity-40"}`}
      >
        המשך
      </button>
    </div>
  );
}
