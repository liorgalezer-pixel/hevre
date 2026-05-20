"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Plus, X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import UserLocationPicker from "@/components/UserLocationPicker";

const PROFILE_KEY = "hevre_profile";
const defaultLanguages = ["עברית", "אנגלית", "ערבית", "ספרדית", "אחר"];

type ProfileData = {
  firstName: string;
  lastName: string;
  phone: string;
  phoneCountry: "+1" | "+972";
  email: string;
  birthDate: string;
  city: string;
  country: string;
  usState: string;
  ilLicense: boolean;
  usLicense: boolean;
  selectedLangs: string[];
};

export default function ProfileEditPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<"+1" | "+972">("+1");
  const [phoneDropOpen, setPhoneDropOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [usState, setUsState] = useState("");
  const [ilLicense, setIlLicense] = useState(false);
  const [usLicense, setUsLicense] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["עברית"]);
  const [customLang, setCustomLang] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      // First try Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("first_name, last_name, phone, email, birth_date, city, country, intl_license, languages")
          .eq("id", user.id)
          .single();
        if (data) {
          if (data.first_name) setFirstName(data.first_name);
          if (data.last_name) setLastName(data.last_name);
          if (data.phone) {
            // Detect country code prefix
            if (data.phone.startsWith("+972")) {
              setPhoneCountry("+972");
              setPhone(data.phone.replace("+972", ""));
            } else if (data.phone.startsWith("+1")) {
              setPhoneCountry("+1");
              setPhone(data.phone.replace("+1", ""));
            } else {
              setPhone(data.phone);
            }
          }
          if (data.email) setEmail(data.email);
          else setEmail(user.email || "");
          if (data.birth_date) setBirthDate(data.birth_date);
          if (data.city) setCity(data.city);
          if (data.country) setCountry(data.country);
          if (data.city) setCity(data.city);
          if (typeof data.intl_license === "boolean") setIlLicense(data.intl_license);
          if (Array.isArray(data.languages) && data.languages.length) setSelectedLangs(data.languages);
          return;
        }
        // User exists in auth but no profile row — set email from auth
        setEmail(user.email || "");
      }

      // Fallback: localStorage cache
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) {
        try {
          const d: ProfileData = JSON.parse(stored);
          if (d.firstName) setFirstName(d.firstName);
          if (d.lastName) setLastName(d.lastName);
          if (d.phone) setPhone(d.phone);
          if (d.phoneCountry) setPhoneCountry(d.phoneCountry);
          if (d.email) setEmail(d.email);
          if (d.birthDate) setBirthDate(d.birthDate);
          if (d.city) setCity(d.city);
          if (d.country) setCountry(d.country);
          if (d.usState) setUsState(d.usState);
          if (typeof d.ilLicense === "boolean") setIlLicense(d.ilLicense);
          if (typeof d.usLicense === "boolean") setUsLicense(d.usLicense);
          if (d.selectedLangs?.length) setSelectedLangs(d.selectedLangs);
        } catch {}
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    const data: ProfileData = {
      firstName, lastName, phone, phoneCountry, email,
      birthDate, city, country, usState, ilLicense, usLicense, selectedLangs,
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));

    // Save to Supabase if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phoneCountry + phone,
        birth_date: birthDate,
        city,
        country,
        il_license: ilLicense,
        us_license: usLicense,
        languages: selectedLangs.filter(l => l !== "__other__"),
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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

  if (saved) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center px-6 gap-6" dir="rtl">
        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 size={52} className="text-green-500" strokeWidth={1.5} />
        </div>
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl font-black text-gray-900">הפרטים עודכנו!</h2>
          <p className="text-sm text-gray-500">השינויים שלך נשמרו בהצלחה</p>
        </div>
        <button
          onClick={() => router.push("/profile")}
          className="w-full h-14 bg-blue-700 text-white font-black text-base rounded-2xl active:bg-blue-800"
        >
          חזרה לאזור אישי
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">עדכון פרטים אישיים</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-32">

        <div className="flex flex-col gap-4">

          {/* First name */}
          <div>
            <label className="text-sm text-gray-600 font-medium block text-right mb-1">שם פרטי</label>
            <input
              type="text"
              value={firstName}
              placeholder="אבי"
              onChange={(e) => setFirstName(e.target.value)}
              dir="rtl"
              className="w-full border border-gray-300 rounded-xl h-11 px-3 text-right text-sm outline-none bg-white placeholder:text-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Last name */}
          <div>
            <label className="text-sm text-gray-600 font-medium block text-right mb-1">שם משפחה</label>
            <input
              type="text"
              value={lastName}
              placeholder="כהן"
              onChange={(e) => setLastName(e.target.value)}
              dir="rtl"
              className="w-full border border-gray-300 rounded-xl h-11 px-3 text-right text-sm outline-none bg-white placeholder:text-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm text-gray-600 font-medium block text-right mb-1">טלפון נייד</label>
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
                    <div className="absolute top-12 left-0 z-40 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden min-w-[130px]">
                      {([{ code: "+1", label: "🇺🇸 ארה״ב" }, { code: "+972", label: "🇮🇱 ישראל" }] as const).map(({ code, label }) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => { setPhoneCountry(code); setPhone(""); setPhoneDropOpen(false); }}
                          className={`w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 ${phoneCountry === code ? "text-blue-700 font-bold" : "text-gray-700"}`}
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
                className="flex-1 border border-gray-300 rounded-xl h-11 px-3 text-left text-sm outline-none bg-white placeholder:text-gray-300 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600 font-medium block text-right mb-1">אימייל</label>
            <input
              type="email"
              value={email}
              placeholder="avi@email.com"
              onChange={(e) => setEmail(e.target.value)}
              style={{ direction: "ltr" }}
              className="w-full border border-gray-300 rounded-xl h-11 px-3 text-left text-sm outline-none bg-white placeholder:text-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Birth date */}
          <div>
            <label className="text-sm text-gray-600 font-medium block text-right mb-1">תאריך לידה</label>
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
              className="w-full border border-gray-300 rounded-xl h-11 px-3 text-right text-sm outline-none bg-white placeholder:text-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Location Picker */}
          <UserLocationPicker
            country={country}
            setCountry={setCountry}
            usState={usState}
            setUsState={setUsState}
            city={city}
            setCity={setCity}
          />

          {/* License toggle */}
          <div className="flex items-center gap-3 py-1">
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
        <div className="mt-6">
          <h2 className="text-base font-bold text-gray-900 text-right mb-1">שפות</h2>
          <p className="text-sm text-gray-400 text-right mb-3">שפות שאתה מדבר ברמה טובה</p>

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
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleSave}
          className="w-full h-14 bg-blue-700 text-white font-black text-lg rounded-2xl active:bg-blue-800 transition-colors"
        >
          שמור שינויים
        </button>
      </div>
    </div>
  );
}
