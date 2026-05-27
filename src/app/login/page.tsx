"use client";

import { useState } from "react";
import posthog from "posthog-js";
import Link from "next/link";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
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
    if (!email.trim() || !password.trim()) {
      setError("יש למלא אימייל וסיסמה");
      return;
    }
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("מייל או סיסמא שגויים");
      setLoading(false);
      return;
    }
    if (data.user) {
      try {
        const { count } = await supabase.from("jobs").select("id", { count: "exact", head: true }).eq("created_by", data.user.id);
        const userType = (count ?? 0) > 0 ? "employer" : "seeker";
        posthog.identify(data.user.id, { email: data.user.email, user_type: userType });
        posthog.capture("user_logged_in", { user_type: userType });
      } catch {}
    }
    router.push("/");
  };

  const handleGoogleLogin = async () => {
    alert("Google נלחץ");
    try {
      const isCapacitor = typeof (window as any).Capacitor !== "undefined";
      const redirectTo = isCapacitor
        ? "hevre://auth/callback"
        : `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { prompt: "select_account" },
          skipBrowserRedirect: isCapacitor,
        },
      });
      if (error) return;

      if (isCapacitor && data?.url) {
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url: data.url });
      }
    } catch {}
  };

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
      <h1 className="font-serif text-3xl font-bold text-ink mb-8 tracking-tight">התחברות</h1>

      {/* Form */}
      <div className="flex flex-col gap-5 mb-4">
        <div>
          <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider block text-right mb-1.5">אימייל</label>
          <div className="bg-paper ring-1 ring-divider focus-within:ring-terracotta rounded-2xl h-14 flex items-center px-4 transition-colors">
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="flex-1 text-left text-base outline-none placeholder:text-ink-3 bg-transparent text-ink"
            />
          </div>
        </div>

        <div>
          <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider block text-right mb-1.5">סיסמה</label>
          <div className="bg-paper ring-1 ring-divider focus-within:ring-terracotta rounded-2xl h-14 flex items-center px-4 gap-2 transition-colors">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-ink-3 min-w-[32px] flex items-center justify-center"
            >
              {showPassword ? <EyeOff size={18} strokeWidth={1.6} /> : <Eye size={18} strokeWidth={1.6} />}
            </button>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              className="flex-1 text-base outline-none bg-transparent text-ink"
            />
          </div>
        </div>
      </div>

      <div className="text-right mb-8">
        <button className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">שכחתי סיסמא</button>
      </div>

      {error && <p className="text-warm-danger text-sm text-center mb-3">{error}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full font-serif font-semibold text-base rounded-2xl h-14 mb-6 transition-opacity text-cream bg-terracotta active:opacity-90 disabled:opacity-40"
      >
        {loading ? "מתחבר..." : "התחברות"}
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-divider" />
        <span className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">אפשל גם דרך</span>
        <div className="flex-1 h-px bg-divider" />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full bg-paper ring-1 ring-divider rounded-2xl h-14 flex items-center justify-center gap-3 active:bg-cream transition-colors mb-6"
      >
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="font-serif font-semibold text-base text-ink">Google</span>
      </button>

      <p className="text-center text-sm text-ink-3">
        עדיין אין לך חשבון?{" "}
        <Link href="/register" className="text-terracotta font-semibold">
          הרשמה
        </Link>
      </p>
    </div>
  );
}
