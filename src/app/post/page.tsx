"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { supabase } from "@/lib/supabase";
import posthog from "posthog-js";
import { X } from "lucide-react";
import LocationPicker from "@/components/LocationPicker";

const STORAGE_KEY = STORAGE_KEYS.POST_STEP_1;

export default function PostJobPage() {
  return (
    <Suspense>
      <PostJobContent />
    </Suspense>
  );
}

function PostJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState<string[]>([""]);

  const addRequirement = () => setRequirements((prev) => [...prev, ""]);
  const updateRequirement = (i: number, val: string) =>
    setRequirements((prev) => prev.map((r, idx) => (idx === i ? val : r)));
  const removeRequirement = (i: number) =>
    setRequirements((prev) => prev.filter((_, idx) => idx !== i));

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setShowAuthModal(true);
        setAuthChecked(true);
        setDataLoaded(true);
        return;
      }
      const uid = user.id;
      setUserId(uid);
      setAuthChecked(true);

      const isNew = searchParams.get("new") === "1";
      if (isNew) {
        const allJobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_JOBS) || "[]");
      const existingJobs = allJobs.filter((j: { createdBy?: string }) => j.createdBy === uid);
        if (existingJobs.length >= 2) {
          setShowLimitModal(true);
          setDataLoaded(true);
          return;
        }
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEYS.POST_STEP_2);
        localStorage.removeItem(STORAGE_KEYS.POST_STEP_3);
        router.replace("/post");
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const d = JSON.parse(saved);
            if (d.jobTitle) setJobTitle(d.jobTitle);
            if (d.companyName) setCompanyName(d.companyName);
            if (d.selectedStates) setSelectedStates(d.selectedStates);
            if (d.selectedCities) setSelectedCities(d.selectedCities);
            if (d.selectedCategories) setSelectedCategories(d.selectedCategories);
            if (d.otherText) setOtherText(d.otherText);
            if (d.description) setDescription(d.description);
            if (d.logoPreview) setLogoPreview(d.logoPreview);
            if (d.requirements) setRequirements(d.requirements);
          } catch {}
        }
      }
      setDataLoaded(true);
    });
  }, [searchParams]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      jobTitle, companyName, selectedStates, selectedCities, selectedCategories, otherText, description, logoPreview, requirements,
    }));
  }, [jobTitle, companyName, selectedStates, selectedCities, selectedCategories, otherText, description, logoPreview, requirements, dataLoaded]);

  const handleContinue = () => {
    posthog.capture("post_job_step", { step: 1, step_name: "basic_info" });
    router.push("/post/step2");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">דף פרסום משרה</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>

      <main className="flex-1 px-4 pt-6 pb-32 flex flex-col gap-5">

        {/* Logo upload */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center py-8 gap-3 active:bg-gray-50"
          >
            {logoPreview ? (
              <Image src={logoPreview} alt="לוגו" width={80} height={80} className="w-20 h-20 rounded-xl object-cover" />
            ) : (
              <>
                <ImageIcon size={48} className="text-gray-400" strokeWidth={1.2} />
                <p className="text-sm text-gray-500">הוספת תמונה / לוגו חברה</p>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Company name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-gray-900 text-right">שם החברה</label>
          <input
            type="text"
            placeholder="שם החברה"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            dir="rtl"
            className="w-full h-13 rounded-xl border border-gray-200 bg-white px-4 text-right text-base outline-none focus:border-blue-500 placeholder:text-gray-300"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-gray-900 text-right">מיקום המשרה</label>
          <LocationPicker
            selectedStates={selectedStates}
            selectedCities={selectedCities}
            onStatesChange={setSelectedStates}
            onCitiesChange={setSelectedCities}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-3">
          <label className="text-base font-bold text-gray-900 text-right">קטגוריה</label>
          <div className="flex flex-wrap gap-2 justify-end">
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const active = selectedCategories.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleCategory(id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-blue-50 text-gray-700 border-blue-100"
                  }`}
                >
                  <span>{label}</span>
                  <Icon size={16} strokeWidth={1.6} />
                </button>
              );
            })}
          </div>
          {selectedCategories.includes("other") && (
            <input
              type="text"
              placeholder="תאר את הקטגוריה..."
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              dir="rtl"
              className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-right text-sm outline-none focus:border-blue-500 placeholder:text-gray-300 mt-1"
            />
          )}
        </div>

        {/* Job title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-gray-900 text-right">שם המשרה</label>
          <input
            type="text"
            placeholder="לדוגמא: מנהל מכירות, נהג משאית..."
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            dir="rtl"
            className="w-full h-13 rounded-xl border border-gray-200 bg-white px-4 text-right text-base outline-none focus:border-blue-500 placeholder:text-gray-300"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-gray-900 text-right">תאור המשרה</label>
          <textarea
            placeholder="תאר את המשרה..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            dir="rtl"
            rows={5}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-base outline-none focus:border-blue-500 placeholder:text-gray-300 resize-none"
          />
        </div>

        {/* Requirements */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-gray-900 text-right">דרישות תפקיד</label>
          <div className="flex flex-col gap-2">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2" style={{ direction: "rtl" }}>
                <span className="text-green-500 shrink-0 text-lg">✓</span>
                <input
                  type="text"
                  value={req}
                  placeholder="הוסף דרישה..."
                  onChange={(e) => updateRequirement(i, e.target.value)}
                  dir="rtl"
                  className="flex-1 h-11 rounded-xl border border-gray-200 bg-white px-3 text-right text-sm outline-none focus:border-blue-500 placeholder:text-gray-300"
                />
                {requirements.length > 1 && (
                  <button onClick={() => removeRequirement(i)} className="w-8 h-8 flex items-center justify-center text-gray-300 active:text-red-400 shrink-0">
                    <X size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addRequirement}
            disabled={requirements.length >= 6 || requirements[requirements.length - 1].trim() === ""}
            className="self-start flex items-center gap-1.5 text-sm font-bold mt-1 disabled:opacity-30 text-blue-700 active:opacity-70"
          >
            <span className="text-lg leading-none">+</span> הוסף דרישה
          </button>
        </div>

      </main>

      {/* Continue button */}
      <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleContinue}
          className="w-full h-14 bg-blue-700 text-white font-bold text-lg rounded-2xl active:bg-blue-800 transition-colors"
        >
          המשך
        </button>
      </div>

      {/* Auth modal */}
      {authChecked && showAuthModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-3xl w-full px-6 py-8 flex flex-col gap-5 shadow-xl">
              <div className="flex justify-end">
                <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                  <X size={18} className="text-gray-600" strokeWidth={2} />
                </button>
              </div>
              <div className="text-4xl text-center">🔒</div>
              <h2 className="text-lg font-black text-gray-900 text-center leading-snug">
                כדי לפרסם מודעה יש להתחבר
              </h2>
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                התחבר או צור חשבון כדי להמשיך
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full h-14 bg-blue-700 text-white font-bold text-base rounded-2xl flex items-center justify-center active:bg-blue-800 transition-colors"
              >
                התחבר / הרשם
              </button>
            </div>
          </div>
        </>
      )}

      {/* Job limit modal */}
      {showLimitModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-3xl w-full px-6 py-8 flex flex-col gap-5 shadow-xl">
              <div className="flex justify-end">
                <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                  <X size={18} className="text-gray-600" strokeWidth={2} />
                </button>
              </div>
              <div className="text-4xl text-center">🚀</div>
              <h2 className="text-lg font-black text-gray-900 text-center leading-snug">
                הגעת למכסת המשרות שלך
              </h2>
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                בגרסה החינמית אפשר לפרסם עד 2 מודעות.<br />
                שדרג ל-<span className="font-black text-blue-700">Hevre+</span> לפרסום ללא הגבלה.
              </p>
              <button
                onClick={() => router.push("/hevre-plus")}
                className="w-full h-14 bg-blue-700 text-white font-black text-base rounded-2xl flex items-center justify-center active:bg-blue-800 transition-colors"
              >
                שדרג ל-Hevre+ ✦
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
