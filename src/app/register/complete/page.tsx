"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";
import { ChevronRight, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import UserLocationPicker from "@/components/UserLocationPicker";

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

  useEffect(() => {
    setEmail(localStorage.getItem("reg_email") || "");
    setFirstName(localStorage.getItem("reg_first_name") || "");
    setLastName(localStorage.getItem("reg_last_name") || "");
  }, []);
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [usState, setUsState] = useState("");
  const [ilLicense, setIlLicense] = useState(false);
  const [licenseCity, setLicenseCity] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["עברית"]);
  const [customLang, setCustomLang] = useState("");
  const [attempted, setAttempted] = useState(false);

  const isInUSA = country === 'ארה"ב';

  const errors = {
    firstName: !firstName.trim(),
    lastName: !lastName.trim(),
    phone: phone.length < (phoneCountry === "+1" ? 10 : 9),
    birthDate: birthDate.length < 10,
    location: isInUSA ? (!usState || !city) : false,
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handleComplete = async () => {
    setAttempted(true);
    if (hasErrors) return;

    setLoading(true);
    setError("");

    const storedEmail = localStorage.getItem("reg_email") || email;
    const storedPassword = sessionStorage.getItem("reg_password") || "";

    // נסה sign up — אם המשתמש כבר קיים, נתחבר במקום
    let userId: string;
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
        // המשתמש כבר קיים — ננסה להתחבר
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

    // upsert כדי לא לכשול אם הפרופיל כבר קיים
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
    posthog.identify(userId, { email: storedEmail, first_name: firstName, last_name: lastName });
    posthog.capture("user_registered", { city, country });
    router.push("/");
  };

  const toggleLang = (lang: string) => {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const addCustomLang = () => {
    const trimmed = customLang.trim();
    if (trimmed && !selectedLangs.includes(trimmed)) {
      setSelectedLangs((prev) => [...prev, trimmed]);
    }
    setCustomLang("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600">
          <ChevronRight size={20} strokeWidth={2} />
        </button>
        <h1 className="text-base font-bold text-gray-900">המשך פרטים אישיים</h1>
        <button onClick={() => router.push("/")} className="text-sm text-gray-400 font-medium">Cancel</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-32">

        {/* Personal fields */}
        <div className="flex flex-col gap-3 mb-6">
          {[
            { label: "שם פרטי", value: firstName, setter: setFirstName, placeholder: "אבי", type: "text", err: errors.firstName },
            { label: "שם משפחה", value: lastName, setter: setLastName, placeholder: "כהן", type: "text", err: errors.lastName },
          ].map(({ label, value, setter, placeholder, type, err }) => (
            <div key={label}>
              <label className={`text-sm font-medium block text-right mb-1 ${attempted && err ? "text-red-500" : "text-gray-600"}`}>
                {label} {attempted && err && <span className="text-red-400 text-xs">— שדה חובה</span>}
              </label>
              <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => setter(e.target.value)}
                dir="rtl"
                className={`w-full border rounded-xl h-11 px-3 text-right text-sm outline-none bg-white placeholder:text-gray-300 ${
                  attempted && err ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
            </div>
          ))}

          {/* Phone with country code */}
          <div>
            <label className={`text-sm font-medium block text-right mb-1 ${attempted && errors.phone ? "text-red-500" : "text-gray-600"}`}>
              טלפון נייד {attempted && errors.phone && <span className="text-red-400 text-xs">— שדה חובה</span>}
            </label>
            <div className="flex gap-2 items-center" style={{ direction: "ltr" }}>
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setPhoneDropOpen((v) => !v)}
                  className="flex items-center gap-1.5 border border-gray-300 rounded-xl h-11 px-3 bg-white text-sm font-bold text-gray-700"
                >
                  {phoneCountry}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {phoneDropOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setPhoneDropOpen(false)} />
                    <div className="absolute top-12 left-0 z-40 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden min-w-[120px]">
                      {([{ code: "+1", label: "🇺🇸 ארה״ב" }, { code: "+972", label: "🇮🇱 ישראל" }] as const).map(({ code, label }) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => { setPhoneCountry(code); setPhone(""); setPhoneDropOpen(false); }}
                          className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-right hover:bg-gray-50 ${phoneCountry === code ? "text-blue-700 font-bold" : "text-gray-700"}`}
                        >
                          <span>{label}</span>
                          <span className="font-bold mr-auto">{code}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <input
                type="tel"
                value={phone}
                maxLength={phoneCountry === "+1" ? 10 : 9}
                placeholder={phoneCountry === "+1" ? "2125551234" : "501234567"}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                style={{ direction: "ltr" }}
                className={`flex-1 border rounded-xl h-11 px-3 text-left text-sm outline-none bg-white placeholder:text-gray-300 ${
                  attempted && errors.phone ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 font-medium block text-right mb-1">אימייל</label>
            <input
              type="email"
              value={email}
              placeholder="avi@email.com"
              onChange={(e) => setEmail(e.target.value)}
              dir="rtl"
              className="w-full border border-gray-300 rounded-xl h-11 px-3 text-right text-sm outline-none bg-white placeholder:text-gray-300"
            />
          </div>

          <div>
            <label className={`text-sm font-medium block text-right mb-1 ${attempted && errors.birthDate ? "text-red-500" : "text-gray-600"}`}>
              תאריך לידה {attempted && errors.birthDate && <span className="text-red-400 text-xs">— שדה חובה</span>}
            </label>
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
              className={`w-full border rounded-xl h-11 px-3 text-right text-sm outline-none bg-white placeholder:text-gray-300 ${
                attempted && errors.birthDate ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
          </div>

          {/* Location Picker */}
          <div className={attempted && errors.location ? "rounded-2xl border border-red-400 bg-red-50 p-3" : ""}>
            {attempted && errors.location && (
              <p className="text-red-500 text-xs text-right mb-2">יש לבחור מדינה ועיר</p>
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium flex-1 text-right">רישיון נהיגה ישראלי / אמריקאי</span>
            <button
              type="button"
              onClick={() => setIlLicense(!ilLicense)}
              className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${ilLicense ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${ilLicense ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Languages */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 text-right mb-1">באילו שפות אתה מדבר?</h2>
          <p className="text-sm text-gray-400 text-right mb-4">שפות שאתה מדבר ברמה טובה</p>

          <div className="flex flex-wrap gap-2 justify-end mb-3">
            {defaultLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  if (lang === "אחר") {
                    setCustomLang("");
                    setSelectedLangs((prev) =>
                      prev.includes("__other__") ? prev.filter(l => l !== "__other__") : [...prev, "__other__"]
                    );
                  } else {
                    toggleLang(lang);
                  }
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  (lang === "אחר" ? selectedLangs.includes("__other__") : selectedLangs.includes(lang))
                    ? "bg-gray-700 text-white border-gray-700"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {lang}
              </button>
            ))}
            {selectedLangs.filter(l => !defaultLanguages.includes(l) && l !== "__other__").map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLang(lang)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-gray-700 text-white border border-gray-700 flex items-center gap-1"
              >
                {lang}
                <X size={12} />
              </button>
            ))}
          </div>

          {/* Custom language input – shown only when "אחר" is selected */}
          {selectedLangs.includes("__other__") && (
            <div className="flex items-center border border-gray-300 rounded-2xl px-4 h-11 gap-2 mb-2">
              <button onClick={addCustomLang} className="text-gray-400">
                <Plus size={18} />
              </button>
              <input
                type="text"
                value={customLang}
                onChange={(e) => setCustomLang(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomLang()}
                placeholder="הוסף שפה נוספת..."
                autoFocus
                className="flex-1 text-right text-sm outline-none bg-transparent placeholder:text-gray-300"
              />
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 text-center mb-5">
          על ידי לחיצה, אתה מאשר את הפרטים ואת{" "}
          <Link href="/terms" className="text-blue-600 underline">התקנון</Link>
          {" "}ומסיים את ההרשמה.
        </p>

        {attempted && hasErrors && (
          <p className="text-red-500 text-sm text-center mb-3 font-medium">יש למלא את כל השדות המסומנים</p>
        )}
        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

        {/* Submit button */}
        <button
          onClick={handleComplete}
          disabled={loading}
          className={`w-full font-bold text-lg rounded-full h-14 transition-colors text-white ${
            loading ? "bg-gray-300" : "bg-yellow-400 active:bg-yellow-500"
          }`}
        >
          {loading ? "שומר..." : "כניסה וסיום"}
        </button>
      </div>
    </div>
  );
}
