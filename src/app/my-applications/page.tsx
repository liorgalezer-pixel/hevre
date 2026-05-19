"use client";

import { useState } from "react";
import { MapPin, DollarSign, MessageSquare, ChevronRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

const pending = [
  { id: "1", title: "מנהל פרויקטים טכנולוגיים", company: "חברה א'", salary: "$150k-170k", location: "LA", date: "10/05/26", logo: "W" },
  { id: "2", title: "מפתח תוכנה בכיר", company: "חברה ב'", salary: "$170k-190k", location: "New York", date: "11/05/26", logo: "G" },
  { id: "3", title: "סוכן מכירות", company: "חברה א'", salary: "$150k-180k", location: "Miami", date: null, logo: null },
  { id: "4", title: "מנהל שיווק", company: "חברה א' המועמדות", salary: null, location: "San Francisco", date: "11/05/26", logo: null, car: true },
];

const approved = [
  { id: "5", title: "מומחה שיווק דיגיטלי", company: "חברה ג' המועמדות", salary: "$140k-160k", location: "LA", connections: 3, logo: "Z" },
  { id: "6", title: "מנהל מכירות אזורי", company: "חברה ד' המועמדות", salary: "$160k-180k", location: "Dubai", connections: 5, logo: "A" },
];

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gray-800 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
      {children}
    </span>
  );
}

export default function MyApplicationsPage() {
  const router = useRouter();
  const [pendingOpen, setPendingOpen] = useState(true);
  const [approvedOpen, setApprovedOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push("/profile")} className="w-11 h-11 flex items-center justify-center">
            <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
          </button>
          <Image src="/hevre-logo.png" alt="Hevre" width={90} height={36} className="object-contain" />
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-28">
        <h1 className="text-2xl font-bold text-blue-900 text-right mb-5">מועמדות למשרות שלי</h1>

        {/* Pending */}
        <button onClick={() => setPendingOpen((v) => !v)} className="flex flex-row-reverse items-center justify-between mb-3 w-full">
          <ChevronDown size={18} className={`text-gray-500 transition-transform ${pendingOpen ? "" : "-rotate-90"}`} strokeWidth={2} />
          <p className="text-base font-bold text-gray-700">משרות בהמתנה ({pending.length})</p>
        </button>
        {pendingOpen && <div className="flex flex-col gap-3 mb-6">
          {pending.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-end gap-2 mb-1">
                <p className="text-base font-black text-gray-900 text-right truncate flex-1">{job.title}</p>
                {job.logo && (
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-black text-gray-600 shrink-0">
                    {job.logo}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 text-right mb-3">{job.company}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
                  ⏳ ממתין לאישור
                </span>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {job.salary && <Tag><DollarSign size={11} />{job.salary}</Tag>}
                  {job.location && <Tag><MapPin size={11} />{job.location}</Tag>}
                  {job.car && <Tag>🚗 כולל רכב</Tag>}
                </div>
              </div>
              {job.date && (
                <p className="text-xs text-gray-300 text-right mt-2">נשלח ב-{job.date}</p>
              )}
            </div>
          ))}
        </div>}

        {/* Approved */}
        <button onClick={() => setApprovedOpen((v) => !v)} className="flex flex-row-reverse items-center justify-between mb-3 w-full">
          <ChevronDown size={18} className={`text-gray-500 transition-transform ${approvedOpen ? "" : "-rotate-90"}`} strokeWidth={2} />
          <p className="text-base font-bold text-gray-700">משרות שאושרו ({approved.length})</p>
        </button>
        {approvedOpen && <div className="flex flex-col gap-3">
          {approved.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl px-4 py-4 shadow-sm" style={{direction:"ltr", display:"flex", alignItems:"center", gap:"12px"}}>
              <button className="flex items-center gap-1.5 bg-blue-700 text-white text-sm font-bold rounded-xl px-3 py-2 active:bg-blue-800 shrink-0">
                <MessageSquare size={14} />
                פתיחת צ׳אט
              </button>
              <div className="flex-1 min-w-0" dir="rtl">
                <p className="text-base font-black text-gray-900 text-right truncate mb-0.5">{job.title}</p>
                <p className="text-xs text-gray-500 text-right mb-2">{job.company}</p>
                <div className="flex flex-wrap gap-1.5 justify-end mb-2">
                  {job.salary && <Tag><DollarSign size={11} />{job.salary}</Tag>}
                  {job.location && <Tag><MapPin size={11} />{job.location}</Tag>}
                </div>
                <p className="text-xs text-green-600 font-bold text-right">✓ המועמדות אושרה!</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-black text-gray-700 shrink-0">
                {job.logo}
              </div>
            </div>
          ))}
        </div>}
      </main>

      <BottomNav />
    </div>
  );
}
