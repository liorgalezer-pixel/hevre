"use client";

import { useState } from "react";
import { X, ChevronLeft, AlertCircle, Lightbulb, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const options = [
  { id: "bug", icon: AlertCircle, label: "נתקלתי בבעיה", color: "text-red-500", bg: "bg-red-50" },
  { id: "suggest", icon: Lightbulb, label: "יש לי הצעה לשיפור", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "praise", icon: Star, label: "רוצה לפרגן לכם", color: "text-yellow-500", bg: "bg-yellow-50" },
];

type FlowStep = "select" | "describe" | "contact" | "done";

const describeConfig: Record<string, { question: string; subtitle: string; nextLabel: string; hasContact: boolean }> = {
  bug: {
    question: "מה ניסית לעשות ומה קרה בפועל? *",
    subtitle: "פירוט מלא יעזור לנו למצוא פתרון יעיל ומהיר\nניתן לשלוח לנו וידאו/ צילום מסך hevre@hevre.app",
    nextLabel: "המשך",
    hasContact: true,
  },
  suggest: {
    question: "מה יכול להפוך את האפליקציה לטובה עוד יותר בשבילך? *",
    subtitle: "פרטים מדויקים יעזרו לנו להפוך את הרעיון למציאות",
    nextLabel: "סיימנו",
    hasContact: false,
  },
  praise: {
    question: "מה הכי אהבת באפליקציה? *",
    subtitle: "לדעת מה נותן לך ערך – כדי לשמור על זה",
    nextLabel: "סיימנו",
    hasContact: false,
  },
};

function ProgressHeader({
  progress,
  onBack,
  onClose,
  showBack,
}: {
  progress: number;
  onBack?: () => void;
  onClose: () => void;
  showBack: boolean;
}) {
  return (
    <div className="px-4 pt-12 pb-4 flex items-center gap-3 border-b border-gray-100">
      {showBack ? (
        <button onClick={onBack} className="w-11 h-11 flex items-center justify-center shrink-0">
          <ChevronLeft size={22} className="text-gray-600 rotate-180" strokeWidth={2} />
        </button>
      ) : (
        <div className="w-11 shrink-0" />
      )}
      <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-800 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <button onClick={onClose} className="w-11 h-11 flex items-center justify-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <X size={16} className="text-gray-500" strokeWidth={2.5} />
        </div>
      </button>
    </div>
  );
}

export default function FeedbackPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState<FlowStep>("select");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const config = selected ? describeConfig[selected] : null;

  const progress = (() => {
    if (step === "select") return 0;
    if (step === "done") return 100;
    if (selected === "bug") return step === "describe" ? 33 : 66;
    return 50;
  })();

  const handleSelectOption = (id: string) => {
    setSelected(id);
    setDescription("");
    setStep("describe");
  };

  const submitToSupabase = async () => {
    try {
      if (selected === "bug") {
        await supabase.from("feedback_bugs").insert({ description, name: name || null, email: email || null, phone: phone || null });
      } else if (selected === "suggest") {
        await supabase.from("feedback_suggestions").insert({ description });
      } else if (selected === "praise") {
        await supabase.from("feedback_praise").insert({ description });
      }
    } catch {
      // fail silently — still show thank you
    }
    setStep("done");
  };

  // ── Done ────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="flex flex-col min-h-screen bg-white" dir="rtl">
        <ProgressHeader progress={100} onClose={() => router.push("/profile")} showBack={false} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
          <span className="text-5xl">🙏</span>
          <p className="text-2xl font-black text-gray-900 text-center">תודה!</p>
          <p className="text-lg font-semibold text-gray-700 text-center">קיבלנו את המשוב שלך</p>
        </div>
        <div className="px-5 pb-12">
          <button
            onClick={() => router.push("/profile")}
            className="w-full h-14 bg-gray-100 text-gray-700 font-bold text-base rounded-2xl active:bg-gray-200 flex items-center justify-center gap-2"
          >
            <ChevronLeft size={18} className="rotate-180" strokeWidth={2.5} />
            סגירה
          </button>
        </div>
      </div>
    );
  }

  // ── Contact (bug only) ────────────────────────────────────────
  if (step === "contact") {
    return (
      <div className="flex flex-col min-h-screen bg-white" dir="rtl">
        <ProgressHeader
          progress={progress}
          onBack={() => setStep("describe")}
          onClose={() => router.push("/profile")}
          showBack
        />
        <main className="flex-1 flex flex-col px-5 pt-10 pb-10 gap-6">
          <p className="text-xl font-black text-gray-900 text-right leading-snug">
            נשמח לשוחח כדי להבין את הבעיה ולפתור אותה.
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="איך קוראים לך"
              className="w-full h-14 border border-gray-200 rounded-2xl px-4 text-right text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 transition-colors"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="מייל"
              className="w-full h-14 border border-gray-200 rounded-2xl px-4 text-right text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 transition-colors"
            />
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="טלפון נייד"
                className="flex-1 h-14 border border-gray-200 rounded-2xl px-4 text-right text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 transition-colors"
              />
              <div className="h-14 px-3 border border-gray-200 rounded-2xl flex items-center gap-1.5 shrink-0">
                <span className="text-lg">🇮🇱</span>
                <span className="text-sm font-medium text-gray-600">IL</span>
              </div>
            </div>
          </div>
          <button
            onClick={submitToSupabase}
            className="w-full h-14 bg-gray-100 text-gray-700 font-bold text-base rounded-2xl active:bg-gray-200 flex items-center justify-center gap-2"
          >
            <ChevronLeft size={18} className="rotate-180" strokeWidth={2.5} />
            סיימנו
          </button>
        </main>
      </div>
    );
  }

  // ── Describe ─────────────────────────────────────────────────
  if (step === "describe" && config) {
    const handleNext = () => {
      if (!description.trim()) return;
      if (config.hasContact) {
        setStep("contact");
      } else {
        submitToSupabase();
      }
    };

    return (
      <div className="flex flex-col min-h-screen bg-white" dir="rtl">
        <ProgressHeader
          progress={progress}
          onBack={() => setStep("select")}
          onClose={() => router.push("/profile")}
          showBack
        />
        <main className="flex-1 flex flex-col px-5 pt-10 pb-10 gap-6">
          <div className="text-right">
            <p className="text-xl font-black text-gray-900 mb-2">{config.question}</p>
            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{config.subtitle}</p>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 text-right placeholder:text-gray-400 outline-none focus:border-blue-400 transition-colors resize-none"
          />
          <button
            onClick={handleNext}
            disabled={!description.trim()}
            className={`w-full h-14 font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-colors ${
              description.trim()
                ? "bg-gray-800 text-white active:bg-gray-900"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ChevronLeft size={18} className="rotate-180" strokeWidth={2.5} />
            {config.nextLabel}
          </button>
        </main>
      </div>
    );
  }

  // ── Select ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">
      <ProgressHeader progress={0} onClose={() => router.back()} showBack={false} />
      <main className="flex-1 flex flex-col justify-center px-5 pb-10 gap-5">
        <p className="text-xl font-black text-gray-900 text-center">איך נוכל לעזור לך? *</p>
        <div className="flex flex-col gap-3">
          {options.map(({ id, icon: Icon, label, color, bg }) => (
            <button
              key={id}
              onClick={() => handleSelectOption(id)}
              className="flex items-center justify-between px-5 h-16 rounded-2xl border border-gray-200 bg-white active:bg-gray-50 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} strokeWidth={2} />
              </div>
              <span className="text-base font-semibold flex-1 text-right mr-3 text-gray-800">{label}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
