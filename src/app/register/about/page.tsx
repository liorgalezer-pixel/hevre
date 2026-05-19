"use client";

import { useState } from "react";
import { Camera, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterAboutPage() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const router = useRouter();

  const ageNum = parseInt(age);
  const ageValid = age.trim().length > 0 && ageNum >= 18 && ageNum <= 99;
  const isValid = ageValid && gender !== null;

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 pt-14" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center text-gray-400">
          <ChevronRight size={26} strokeWidth={2} />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-black text-blue-800">שנדע משהו עליך</h1>
          <p className="text-sm text-gray-500 mt-1">הפרטים האלה יעזרו למעסיקים להכיר אותך</p>
        </div>
        <div className="w-11" />
      </div>

      {/* Profile photo */}
      <div className="flex flex-col items-center mb-8">
        <button
          onClick={() => setShowPhotoSheet(true)}
          className="w-28 h-28 rounded-full bg-gray-200 flex flex-col items-center justify-center mb-2 active:bg-gray-300 transition-colors"
        >
          <Camera size={28} className="text-gray-400" strokeWidth={1.6} />
          <span className="text-xs text-gray-400 mt-1">תמונה</span>
        </button>
        <p className="text-sm text-gray-500">לחץ להוספת תמונת פרופיל</p>
      </div>

      {/* Age */}
      <div className="mb-7">
        <label className="text-sm font-semibold text-gray-800 block text-right mb-2">גיל*</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className={`w-full border-b pb-2 text-right text-base outline-none bg-transparent text-gray-800 ${age && !ageValid ? "border-red-400" : "border-gray-300"}`}
          min="18"
          max="99"
        />
        {age && ageNum < 18 && (
          <p className="text-xs text-red-500 text-right mt-1">גיל מינימלי להרשמה הוא 18</p>
        )}
        {age && ageNum > 99 && (
          <p className="text-xs text-red-500 text-right mt-1">גיל מקסימלי להרשמה הוא 99</p>
        )}
      </div>

      {/* Gender */}
      <div className="mb-10">
        <label className="text-sm font-semibold text-gray-800 block text-right mb-3">מין*</label>
        <div className="flex gap-3">
          {["זכר", "נקבה", "אחר"].map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`flex-1 h-12 rounded-2xl border text-base font-medium transition-colors ${
                gender === g
                  ? "border-blue-700 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-gray-100 text-gray-700"
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
        className={`w-full font-bold text-lg rounded-2xl h-14 transition-colors text-white ${isValid ? "bg-blue-800 active:bg-blue-900" : "bg-gray-300"}`}
      >
        המשך
      </button>

      {/* Photo bottom sheet */}
      {showPhotoSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowPhotoSheet(false)}
          />
          <div className="fixed bottom-0 right-0 left-0 z-50 bg-white rounded-t-3xl px-6 pt-5 pb-10">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setShowPhotoSheet(false)} className="w-10 h-10 flex items-center justify-center text-gray-400">
                <X size={22} />
              </button>
              <h2 className="text-base font-bold text-gray-900">הוסף תמונת פרופיל</h2>
              <div className="w-10" />
            </div>

            <button className="w-full flex items-center justify-center gap-3 h-14 bg-blue-700 text-white font-bold text-base rounded-2xl mb-3 active:bg-blue-800">
              <Camera size={20} />
              צלם תמונה
            </button>

            <button className="w-full flex items-center justify-center gap-3 h-14 bg-gray-100 text-gray-800 font-bold text-base rounded-2xl active:bg-gray-200">
              <span className="text-xl">🖼️</span>
              בחר מהגלריה
            </button>
          </div>
        </>
      )}
    </div>
  );
}
