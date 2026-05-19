"use client";

import { useState } from "react";
import Image from "next/image";
import { User, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterDetailsPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 pt-14" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center text-gray-700">
          <ChevronLeft size={28} strokeWidth={2} />
        </button>
        <Image src="/hevre-logo.png" alt="Hevre" width={56} height={56} className="object-contain rounded-xl" />
        <div className="w-11" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-black text-gray-900 text-center mb-10">
        הצטרף ל-HEVRE
      </h1>

      {/* Form */}
      <div className="flex flex-col gap-5 flex-1">

        {/* First name */}
        <div>
          <label className="text-sm font-semibold text-gray-800 block text-right mb-1.5">
            שם פרטי*
          </label>
          <div className="border border-gray-300 rounded-xl h-14 flex items-center px-4 gap-3 bg-white">
            <User size={20} strokeWidth={1.6} className="text-gray-300" />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="flex-1 text-right text-base outline-none bg-transparent text-gray-800 placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Last name */}
        <div>
          <label className="text-sm font-semibold text-gray-800 block text-right mb-1.5">
            שם משפחה*
          </label>
          <div className="border border-gray-300 rounded-xl h-14 flex items-center px-4 gap-3 bg-white">
            <User size={20} strokeWidth={1.6} className="text-gray-300" />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="flex-1 text-right text-base outline-none bg-transparent text-gray-800 placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Continue button */}
      <div className="pb-10 pt-6">
        <button
          disabled={!isValid}
          onClick={() => {
          if (!isValid) return;
          localStorage.setItem("reg_first_name", firstName);
          localStorage.setItem("reg_last_name", lastName);
          router.push("/register/about");
        }}
          className={`w-full font-bold text-lg rounded-full h-14 transition-colors text-white ${isValid ? "bg-blue-700 active:bg-blue-800" : "bg-gray-300"}`}
        >
          המשך
        </button>
      </div>
    </div>
  );
}
