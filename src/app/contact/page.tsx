"use client";

import { useState } from "react";
import { Mail, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  if (!open) {
    router.back();
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={() => { setOpen(false); router.back(); }} />

      {/* Sheet */}
      <div className="relative w-full bg-white rounded-t-3xl px-5 pt-5 pb-10 flex flex-col gap-4 shadow-2xl">

        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => { setOpen(false); router.back(); }} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
            <X size={16} className="text-gray-500" strokeWidth={2.5} />
          </button>
          <h2 className="text-lg font-black text-gray-900">צור קשר</h2>
          <div className="w-9" />
        </div>

        <p className="text-sm text-gray-500 text-center">בחר את דרך הפנייה המועדפת עליך</p>

        {/* Options */}
        <div className="flex flex-col gap-3 mt-1">
          <a
            href="mailto:lior.galezer@gmail.com"
            className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 active:bg-gray-100 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Mail size={22} className="text-blue-600" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-base font-bold text-gray-900">אימייל</span>
              <span className="text-sm text-gray-400">lior.galezer@gmail.com</span>
            </div>
          </a>

          <a
            href="https://wa.me/972558811609"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 active:bg-gray-100 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <MessageCircle size={22} className="text-green-600" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-base font-bold text-gray-900">WhatsApp</span>
              <span className="text-sm text-gray-400">+972 55-881-1609</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
