"use client";

import { useState } from "react";
import posthog from "posthog-js";
import Link from "next/link";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("מייל או סיסמא שגויים");
      setLoading(false);
      return;
    }
    if (data.user) {
      // Detect user_type: employer if they have posted jobs
      const { count } = await supabase.from("jobs").select("id", { count: "exact", head: true }).eq("created_by", data.user.id);
      const userType = (count ?? 0) > 0 ? "employer" : "seeker";
      posthog.identify(data.user.id, { email: data.user.email, user_type: userType });
      posthog.capture("user_logged_in", { user_type: userType });
    }
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-paper px-6 pt-14" dir="rtl">

      {/* Back button */}
      <button onClick={() => router.back()} className="absolute top-12 right-4 w-11 h-11 flex items-center justify-center">
        <ChevronRight size={24} className="text-ink-2" strokeWidth={2} />
      </button>

      {/* Logo wordmark */}
      <div className="flex justify-center mb-10">
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-4xl font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-2.5 h-2.5 rounded-full bg-terracotta self-center" />
        </div>
      </div>

      {/* Title */}
      <h1 className="font-serif text-4xl font-bold text-ink text-center mb-2 tracking-tight">דף התחברות</h1>
      <p className="text-ink-3 text-center text-base mb-10">היי טוב לראות אותך שוב!</p>

      {/* Form */}
      <div className="flex flex-col gap-6 mb-4">
        <div className="border-b border-divider pb-2">
          <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="rtl"
            className="w-full text-right text-base outline-none placeholder:text-ink-3 bg-transparent"
          />
        </div>

        <div className="border-b border-divider pb-2 flex items-center gap-2" style={{ direction: "ltr" }}>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-ink-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="rtl"
            className="flex-1 text-right text-base outline-none placeholder:text-ink-3 bg-transparent"
          />
        </div>
      </div>

      <div className="text-right mb-8">
        <button className="text-sm text-ink-2">שכחתי סיסמא</button>
      </div>

      {error && <p className="text-warm-danger text-sm text-center mb-3">{error}</p>}

      <button
        onClick={handleLogin}
        disabled={loading || !email || !password}
        className={`w-full font-serif font-semibold text-lg rounded-2xl h-14 mb-6 transition-colors text-cream ${loading || !email || !password ? "bg-cream-warm text-ink-3" : "bg-ink active:bg-terracotta-deep"}`}
      >
        {loading ? "מתחבר..." : "התחברות"}
      </button>

      <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-center mb-4">אפשר גם דרך</p>

      <button
        onClick={async () => {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              queryParams: { prompt: "select_account" },
            },
          });
          if (error) alert("שגיאה: " + error.message);
        }}
        className="w-full ring-1 ring-divider rounded-2xl h-14 flex items-center justify-center gap-3 bg-paper shadow-sm active:bg-cream transition-colors mb-8"
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="text-ink-2 font-medium text-base">Google</span>
      </button>

      <p className="text-center text-sm text-ink-2">
        עדיין לא נרשמת ל hevre{" "}
        <Link href="/register" className="text-terracotta font-bold">
          להרשמה
        </Link>
      </p>
    </div>
  );
}
