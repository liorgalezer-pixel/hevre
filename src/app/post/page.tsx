"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ImageIcon, Check } from "lucide-react";
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
    setSelectedCategories((prev) => prev.includes(id) ? [] : [id]);
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

  const canContinue =
    companyName.trim().length > 0 &&
    (selectedStates.length > 0 || selectedCities.length > 0) &&
    selectedCategories.length > 0;

  const handleContinue = () => {
    posthog.capture("post_job_step", { step: 1, step_name: "basic_info" });
    router.push("/post/step2");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
            <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">פרסום משרה</h1>
          <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shrink-0 ${
                s === 1 ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-400"
              }`}>
                {s}
              </div>
              {s < 4 && <div className="h-1 flex-1 rounded-full bg-gray-200" />}
            </div>
          ))}
        </div>
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
          <label className="text-base font-bold text-gray-900 text-right">שם החברה <span className="text-red-500">*</span></label>
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
          <label className="text-base font-bold text-gray-900 text-right">מיקום המשרה <span className="text-red-500">*</span></label>
          <LocationPicker
            selectedStates={selectedStates}
            selectedCities={selectedCities}
            onStatesChange={setSelectedStates}
            onCitiesChange={setSelectedCities}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-3">
          <label className="text-base font-bold text-gray-900 text-right">קטגוריה <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const active = selectedCategories.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleCategory(id)}
                  className={`flex flex-col items-center justify-center gap-2 h-20 rounded-2xl border-2 transition-all ${
                    active ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
                  }`}
                >
                  <Icon size={26} className={active ? "text-blue-700" : "text-gray-500"} strokeWidth={1.5} />
                  <span className={`text-xs font-semibold ${active ? "text-blue-700" : "text-gray-600"}`}>{label}</span>
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


      </main>

      {/* Continue button */}
      <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full h-14 bg-blue-700 text-white font-bold text-lg rounded-2xl active:bg-blue-800 transition-colors disabled:opacity-40"
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
