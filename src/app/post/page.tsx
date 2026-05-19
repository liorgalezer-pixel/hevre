"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { STORAGE_KEYS } from "@/lib/storage-keys";

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

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const isNew = searchParams.get("new") === "1";
    if (isNew) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEYS.POST_STEP_2);
      localStorage.removeItem(STORAGE_KEYS.POST_STEP_3);
      return;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const d = JSON.parse(saved);
      if (d.jobTitle) setJobTitle(d.jobTitle);
      if (d.companyName) setCompanyName(d.companyName);
      if (d.companyAddress) setCompanyAddress(d.companyAddress);
      if (d.selectedCategories) setSelectedCategories(d.selectedCategories);
      if (d.otherText) setOtherText(d.otherText);
      if (d.description) setDescription(d.description);
      if (d.logoPreview) setLogoPreview(d.logoPreview);
    } catch {}
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

  const handleContinue = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      jobTitle, companyName, companyAddress, selectedCategories, otherText, description, logoPreview,
    }));
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

        {/* Company address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-gray-900 text-right">כתובת החברה</label>
          <input
            type="text"
            placeholder="כתובת החברה"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            dir="rtl"
            className="w-full h-13 rounded-xl border border-gray-200 bg-white px-4 text-right text-base outline-none focus:border-blue-500 placeholder:text-gray-300"
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
    </div>
  );
}
