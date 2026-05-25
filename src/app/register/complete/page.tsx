"use client";

import { useState, useEffect, useRef } from "react";
import posthog from "posthog-js";
import { ChevronLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import UserLocationPicker from "@/components/UserLocationPicker";
import LanguageSearchModal from "@/components/LanguageSearchModal";

const defaultLanguages = ["עברית", "אנגלית", "ערבית", "ספרדית", "אחר"];

export default function RegisterCompletePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<"+1" | "+972">("+1");
  const [phoneDropOpen, setPhoneDropOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState('ארה"ב');
  const [usState, setUsState] = useState("");
  const [ilLicense, setIlLicense] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["עברית"]);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    const draft = sessionStorage.getItem("reg_complete_draft");
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.firstName) setFirstName(d.firstName);
        if (d.lastName) setLastName(d.lastName);
        if (d.phone) setPhone(d.phone);
        if (d.phoneCountry) setPhoneCountry(d.phoneCountry);
        if (d.birthDate) setBirthDate(d.birthDate);
        if (d.city) setCity(d.city);
        if (d.country) setCountry(d.country);
        if (d.usState) setUsState(d.usState);
        if (typeof d.ilLicense === "boolean") setIlLicense(d.ilLicense);
        if (d.selectedLangs) setSelectedLangs(d.selectedLangs);
      } catch {}
    } else {
      setFirstName(localStorage.getItem("reg_first_name") || "");
      setLastName(localStorage.getItem("reg_last_name") || "");
    }

    const storedEmail = localStorage.getItem("reg_email") || "";
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) setEmail(user.email);
      });
    }
    initializedRef.current = true;
  }, []);

  useEffect(() => {
    if (!initializedRef.current) return;
    sessionStorage.setItem("reg_complete_draft", JSON.stringify({
      firstName, lastName, phone, phoneCountry, birthDate, city, country, usState, ilLicense, selectedLangs,
    }));
  }, [firstName, lastName, phone, phoneCountry, birthDate, city, country, usState, ilLicense, selectedLangs]);

  const isInUSA = country === 'ארה"ב';

  const errors = {
    firstName: !firstName.trim(),
    lastName: !lastName.trim(),
    phone: phoneCountry === "+1"
      ? !/^\d{10}$/.test(phone.replace(/\D/g, ""))
      : !/^\d{9,10}$/.test(phone.replace(/\D/g, "")),
    birthDate: birthDate.length < 10,
    location: isInUSA ? (!usState || !city) : !country,
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handleComplete = async () => {
    setAttempted(true);
    if (hasErrors) return;

    setLoading(true);
    setError("");

    const storedEmail = localStorage.getItem("reg_email") || email;
    const storedPassword = sessionStorage.getItem("reg_password") || "";

    let userId: string;

    const { data: { user: existingUser } } = await supabase.auth.getUser();
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: storedEmail,
        password: storedPassword,
      });

      if (signUpError) {
        const alreadyExists =
          signUpError.message.toLowerCase().includes("already registered") ||
          signUpError.message.toLowerCase().includes("already exists") ||
          signUpError.message.toLowerCase().includes("user already");

        if (alreadyExists) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: storedEmail,
            password: storedPassword,
          });
          if (signInError || !signInData.user) {
            setError("האימייל כבר רשום. אם שכחת סיסמה — חזור להתחברות.");
            setLoading(false);
            return;
          }
          userId = signInData.user.id;
        } else {
          setError(`שגיאה: ${signUpError.message}`);
          setLoading(false);
          return;
        }
      } else if (!signUpData.user) {
        setError("לא התקבל משתמש — נסה שוב");
        setLoading(false);
        return;
      } else {
        userId = signUpData.user.id;
      }
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      email: storedEmail,
      first_name: firstName,
      last_name: lastName,
      age: parseInt(localStorage.getItem("reg_age") || "0"),
      gender: localStorage.getItem("reg_gender") || "",
      phone,
      birth_date: birthDate,
      city,
      country,
      intl_license: ilLicense,
      il_license: ilLicense,
      us_license: false,
      languages: selectedLangs.filter(l => l !== "__other__"),
    });

    if (profileError) { setError(`שגיאה: ${profileError.message}`); setLoading(false); return; }

    ["reg_email","reg_first_name","reg_last_name","reg_age","reg_gender"].forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem("reg_password");
    sessionStorage.removeItem("reg_complete_draft");
    posthog.identify(userId, { email: storedEmail, first_name: firstName, last_name: lastName, user_type: "seeker" });
    posthog.capture("user_registered", { city, country, user_type: "seeker" });
    router.push("/");
  };

  const toggleLang = (lang: string) => {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const fieldClass = (hasErr: boolean) =>
    `h-14 bg-paper ring-1 rounded-2xl flex items-center px-4 focus-within:ring-terracotta transition-colors ${hasErr ? "ring-warm-danger" : "ring-divider"}`;

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
        <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">עוד כמה פרטים</h1>
        <p className="text-sm text-ink-2 mt-1">כמעט סיימנו — מלא את הפרטים האחרונים</p>
      </div>

      <div className="flex flex-col gap-5">

        {/* First name */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">
            שם פרטי {attempted && errors.firstName && <span className="text-warm-danger normal-case">— שדה חובה</span>}
          </label>
          <div className={fieldClass(attempted && errors.firstName)}>
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
          <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">
            שם משפחה {attempted && errors.lastName && <span className="text-warm-danger normal-case">— שדה חובה</span>}
          </label>
          <div className={fieldClass(attempted && errors.lastName)}>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="ישראלי"
              className="flex-1 text-right text-base outline-none bg-transparent text-ink placeholder:text-ink-3"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">
            טלפון נייד {attempted && errors.phone && <span className="text-warm-danger normal-case">— שדה חובה</span>}
          </label>
          <div className={`${fieldClass(attempted && errors.phone)} gap-2`} style={{ direction: "ltr" }}>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setPhoneDropOpen((v) => !v)}
                className="flex items-center gap-1 text-sm font-bold text-ink"
              >
                {phoneCountry}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {phoneDropOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setPhoneDropOpen(false)} />
                  <div className="absolute top-8 left-0 z-40 bg-paper ring-1 ring-divider rounded-2xl shadow-lg overflow-hidden min-w-[140px]">
                    {([{ code: "+1", label: "🇺🇸 ארה״ב" }, { code: "+972", label: "🇮🇱 ישראל" }] as const).map(({ code, label }) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => { setPhoneCountry(code); setPhone(""); setPhoneDropOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-sm ${phoneCountry === code ? "text-terracotta font-bold" : "text-ink"}`}
                        dir="rtl"
                      >
                        <span>{label}</span>
                        <span className="font-bold mr-auto">{code}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="w-px h-6 bg-divider shrink-0" />
            <input
              type="tel"
              value={phone}
              maxLength={10}
              placeholder={phoneCountry === "+1" ? "2125551234" : "0501234567"}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              style={{ direction: "ltr" }}
              className="flex-1 text-left text-base outline-none bg-transparent text-ink placeholder:text-ink-3"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">אימייל</label>
          <div className={fieldClass(false)}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="avi@email.com"
              style={{ direction: "ltr" }}
              className="flex-1 text-left text-base outline-none bg-transparent text-ink placeholder:text-ink-3"
            />
          </div>
        </div>

        {/* Birth date */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">
            תאריך לידה {attempted && errors.birthDate && <span className="text-warm-danger normal-case">— שדה חובה</span>}
          </label>
          <div className={fieldClass(attempted && errors.birthDate)}>
            <input
              type="text"
              value={birthDate}
              placeholder="01/01/1990"
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                let formatted = digits;
                if (digits.length > 4) formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
                else if (digits.length > 2) formatted = digits.slice(0, 2) + "/" + digits.slice(2);
                setBirthDate(formatted);
              }}
              className="flex-1 text-right text-base outline-none bg-transparent text-ink placeholder:text-ink-3"
            />
          </div>
        </div>

        {/* Location */}
        <div className={`flex flex-col gap-1.5 ${attempted && errors.location ? "p-3 ring-1 ring-warm-danger rounded-2xl bg-paper" : ""}`}>
          {attempted && errors.location && (
            <p className="text-warm-danger text-xs text-right">יש לבחור מדינה ועיר</p>
          )}
          <UserLocationPicker
            country={country}
            setCountry={setCountry}
            usState={usState}
            setUsState={setUsState}
            city={city}
            setCity={setCity}
          />
        </div>

        {/* License toggle */}
        <div className="flex items-center gap-3 py-1">
          <span className="text-base text-ink flex-1 text-right">רישיון נהיגה ישראלי / אמריקאי</span>
          <button
            type="button"
            onClick={() => setIlLicense(!ilLicense)}
            className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${ilLicense ? "bg-terracotta" : "bg-divider"}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${ilLicense ? "right-0.5" : "left-0.5"}`} />
          </button>
        </div>

        {/* Languages */}
        <div className="flex flex-col gap-3">
          <div className="text-right">
            <h2 className="font-serif text-lg font-bold text-ink">באילו שפות אתה מדבר?</h2>
            <p className="text-sm text-ink-2 mt-0.5">שפות שאתה מדבר ברמה טובה</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-start" dir="rtl">
            {defaultLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => lang === "אחר" ? setLangModalOpen(true) : toggleLang(lang)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedLangs.includes(lang)
                    ? "bg-terracotta text-cream"
                    : "bg-paper ring-1 ring-divider text-ink"
                }`}
              >
                {lang}
              </button>
            ))}
            {selectedLangs.filter(l => !defaultLanguages.includes(l) && l !== "__other__").map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLang(lang)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-terracotta text-cream flex items-center gap-1"
              >
                {lang}
                <X size={12} />
              </button>
            ))}
          </div>
        </div>

        {langModalOpen && (
          <LanguageSearchModal
            selected={selectedLangs}
            onAdd={(lang) => setSelectedLangs(prev => [...prev, lang])}
            onClose={() => setLangModalOpen(false)}
          />
        )}

        {/* Disclaimer */}
        <p className="text-xs text-ink-3 text-center">
          על ידי לחיצה, אתה מאשר את{" "}
          <Link href="/terms" className="text-terracotta underline">התקנון</Link>
          {" "}ומסיים את ההרשמה.
        </p>

        {attempted && hasErrors && (
          <p className="text-warm-danger text-sm text-center font-medium">יש למלא את כל השדות המסומנים</p>
        )}
        {error && <p className="text-warm-danger text-sm text-center">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleComplete}
          disabled={loading}
          className={`w-full h-14 font-serif font-semibold text-base rounded-2xl transition-opacity text-cream ${loading ? "bg-ink-3 opacity-40" : "bg-terracotta active:opacity-90"}`}
        >
          {loading ? "שומר..." : "כניסה וסיום"}
        </button>
      </div>
    </div>
  );
}
