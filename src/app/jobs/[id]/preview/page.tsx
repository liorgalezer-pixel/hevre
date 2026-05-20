"use client";

import { useState, useEffect, use } from "react";
import { ChevronRight, MapPin, DollarSign, Clock, IdCard, Car, BedDouble, Heart, Share2, Eye } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Job = {
  id: string;
  title: string;
  salary: string;
  companyAddress: string;
  companyName: string;
  categories: string[];
  logoPreview: string | null;
  description: string;
  weekend: boolean;
  holidays: boolean;
  license: boolean;
  car: boolean;
  housing: boolean;
  startTime: string;
  endTime: string;
};

function mapRow(j: Record<string, unknown>): Job {
  return {
    id: j.id as string,
    title: j.title as string,
    salary: (j.salary as string) || "",
    companyAddress: (j.company_address as string) || "",
    companyName: (j.company_name as string) || "",
    categories: (j.categories as string[]) || [],
    logoPreview: (j.logo_url as string) || null,
    description: (j.description as string) || "",
    weekend: !!j.weekend,
    holidays: !!j.holidays,
    license: !!j.license,
    car: !!j.car,
    housing: !!j.housing,
    startTime: (j.start_time as string) || "08:00",
    endTime: (j.end_time as string) || "18:00",
  };
}

export default function JobPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("jobs").select("*").eq("id", id).single();
      if (data) setJob(mapRow(data as Record<string, unknown>));
    })();
  }, [id]);

  if (!job) return (
    <div className="flex flex-col min-h-screen items-center justify-center" dir="rtl">
      <p className="text-gray-500">המשרה לא נמצאה</p>
    </div>
  );

  const tags = [
    job.salary && { icon: DollarSign, text: job.salary },
    job.companyAddress && { icon: MapPin, text: job.companyAddress },
    (job.startTime || job.endTime) && { icon: Clock, text: `${job.startTime || "08:00"} - ${job.endTime || "18:00"}` },
    job.license && { icon: IdCard, text: "רישיון נהיגה" },
    job.car && { icon: Car, text: "כולל רכב" },
    job.housing && { icon: BedDouble, text: "כולל דיור" },
  ].filter(Boolean) as { icon: React.ElementType; text: string }[];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100" dir="rtl">

      {/* Preview banner */}
      <div className="bg-blue-700 px-4 py-2.5 flex items-center justify-center gap-2">
        <Eye size={15} className="text-blue-200" strokeWidth={2} />
        <p className="text-white text-sm font-semibold">תצוגה מקדימה — כך המשרה נראית למחפשי עבודה</p>
      </div>

      {/* Header */}
      <header className="bg-white px-4 pt-10 pb-3 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
        <div className="flex items-center gap-1">
          <button onClick={() => setLiked((v) => !v)} className="w-11 h-11 flex items-center justify-center">
            <Heart
              size={24}
              className={liked ? "text-red-500 fill-red-500" : "text-gray-400"}
              strokeWidth={1.8}
            />
          </button>
          <button className="w-11 h-11 flex items-center justify-center">
            <Share2 size={22} className="text-gray-400" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-32">

        {/* Job card hero */}
        <div className="bg-white px-4 pt-5 pb-5 border-b border-gray-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
              {job.logoPreview ? (
                <Image src={job.logoPreview} alt="לוגו" width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-gray-400">H</span>
              )}
            </div>
            <div className="flex-1 text-right">
              <h1 className="text-xl font-black text-gray-900 leading-snug mb-0.5">{job.title}</h1>
              {job.companyName && <p className="text-sm text-gray-500">{job.companyName}</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 justify-end">
            {tags.map(({ icon: Icon, text }, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                <Icon size={12} strokeWidth={2} />
                {text}
              </span>
            ))}
          </div>

          {/* Extras */}
          {(job.weekend || job.holidays) && (
            <div className="flex gap-2 justify-end mt-2">
              {job.weekend && <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">עבודה בסוף שבוע</span>}
              {job.holidays && <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">עבודה בחגים</span>}
            </div>
          )}
        </div>

        {/* Categories */}
        {job.categories && job.categories.length > 0 && (
          <div className="bg-white px-4 py-4 border-b border-gray-100 mt-2">
            <p className="text-sm font-bold text-gray-700 text-right mb-2">קטגוריות</p>
            <div className="flex flex-wrap gap-2 justify-end">
              {job.categories.map((cat) => (
                <span key={cat} className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div className="bg-white px-4 py-4 mt-2 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-700 text-right mb-2">תיאור המשרה</p>
            <p className="text-sm text-gray-600 text-right leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>
        )}

      </main>

      {/* Apply button (disabled in preview) */}
      <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-2">
        <p className="text-center text-xs text-blue-600 font-semibold">תצוגה מקדימה — הכפתור אינו פעיל</p>
        <button
          disabled
          className="w-full h-14 bg-blue-300 text-white font-black text-lg rounded-2xl cursor-not-allowed"
        >
          שלח מועמדות
        </button>
      </div>
    </div>
  );
}
