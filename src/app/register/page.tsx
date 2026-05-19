"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Lock, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/** Constant-time string comparison to prevent timing-based secret leakage (CWE-208). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${met ? "text-green-500" : "text-red-500"}`}>
        {met ? "✓" : "✗"}
      </span>
    </div>
  );
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = () => {
    if (!formValid) return;
    localStorage.setItem("reg_email", email);
    // Use sessionStorage for the password so it is never persisted to disk
    sessionStorage.setItem("reg_password", password);
    router.push("/register/details");
  };
  const [emailTouched, setEmailTouched] = useState(false);

  const isEnglishOnly = /^[a-zA-Z0-9._%+\-@]+$/.test(email);
  const isGmail = email.toLowerCase().endsWith("@gmail.com");
  const emailValid = email.length > 0 && isEnglishOnly && isGmail;
  const emailError = emailTouched && email.length > 0 && !emailValid;

  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordTouched = password.length > 0;

  const formValid = emailValid && hasLength && hasUppercase && hasNumber && safeEqual(confirm, password);

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 pt-14 pb-10" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Image src="/hevre-logo.png" alt="Hevre" width={44} height={44} className="object-contain rounded-xl" />
        <h2 className="text-xl font-bold text-gray-900">ברוכים הבאים ל-Hevre</h2>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-black text-gray-900 text-center mb-8">הרשמה</h1>

      <div className="flex flex-col gap-5 mb-8">

        {/* Email */}
        <div>
          <label className="text-sm text-gray-700 font-medium block text-right mb-1.5">אימייל</label>
          <div className={`border rounded-xl h-14 flex items-center px-4 gap-3 bg-white ${emailError ? "border-red-400" : "border-gray-300"}`}>
            <Mail size={18} strokeWidth={1.6} className="text-gray-400" />
            <input
              type="text"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\x00-\x7F]/g, "");
                setEmail(val);
              }}
              onBlur={() => setEmailTouched(true)}
              className="flex-1 text-left text-base outline-none placeholder:text-gray-400 bg-transparent"
              dir="ltr"
            />
          </div>
          {emailError && (
            <p className="text-xs text-red-500 text-right mt-1">
              {!isEnglishOnly ? "אנגלית בלבד" : "חייב להיות כתובת @gmail.com"}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-sm text-gray-700 font-medium block text-right mb-1.5">סיסמא</label>
          <div className="border border-gray-300 rounded-xl h-14 flex items-center px-4 gap-2 bg-white">
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 min-w-[32px] flex items-center justify-center">
              {showPassword ? <EyeOff size={18} strokeWidth={1.6} /> : <Eye size={18} strokeWidth={1.6} />}
            </button>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 text-right text-base outline-none bg-transparent"
              dir="ltr"
            />
            <Lock size={20} strokeWidth={1.6} className="text-gray-400" />
          </div>
          {passwordTouched && (
            <div className="flex flex-col gap-1 mt-2">
              <PasswordRule met={hasLength} label="לפחות 8 תווים" />
              <PasswordRule met={hasUppercase} label="לפחות אות גדולה אחת" />
              <PasswordRule met={hasNumber} label="לפחות מספר אחד" />
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-sm text-gray-700 font-medium block text-right mb-1.5">אימות סיסמא</label>
          <div className={`border rounded-xl h-14 flex items-center px-4 gap-2 bg-white ${confirm.length > 0 && !safeEqual(confirm, password) ? "border-red-400" : "border-gray-300"}`}>
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 min-w-[32px] flex items-center justify-center">
              {showConfirm ? <EyeOff size={18} strokeWidth={1.6} /> : <Eye size={18} strokeWidth={1.6} />}
            </button>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="flex-1 text-right text-base outline-none bg-transparent"
              dir="ltr"
            />
            <LockKeyhole size={20} strokeWidth={1.6} className="text-gray-400" />
          </div>
          {confirm.length > 0 && !safeEqual(confirm, password) && (
            <p className="text-xs text-red-500 text-right mt-1">הסיסמאות לא תואמות</p>
          )}
        </div>
      </div>

      {/* Register button */}
      <button
        disabled={!formValid}
        onClick={handleRegister}
        className={`w-full font-bold text-lg rounded-full h-14 mb-6 transition-colors text-white ${formValid ? "bg-orange-400 active:bg-orange-500" : "bg-gray-300"}`}
      >
        הרשמה
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-400 text-sm">אפשר גם דרך</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Google button */}
      <button className="w-full border border-gray-200 rounded-2xl h-14 flex items-center justify-center gap-3 bg-white shadow-sm active:bg-gray-50 transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="text-gray-700 font-medium text-base">Google</span>
      </button>
    </div>
  );
}
