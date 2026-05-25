"use client";

import { useState } from "react";
import { X, ChevronLeft, AlertCircle, Lightbulb, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const options = [
  { id: "bug", icon: AlertCircle, label: "נתקלתי בבעיה", color: "text-warm-danger", bg: "bg-warm-danger-bg" },
  { id: "suggest", icon: Lightbulb, label: "יש לי הצעה לשיפור", color: "text-warm-info-text", bg: "bg-warm-info-bg" },
  { id: "praise", icon: Star, label: "רוצה לפרגן לכם", color: "text-terracotta", bg: "bg-cream-warm" },
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

function ProgressHeader({ progress, onBack, onClose, showBack }: {
  progress: number; onBack?: () => void; onClose: () => void; showBack: boolean;
}) {
  return (
    <div className="px-4 pt-12 pb-4 flex items-center gap-3 border-b border-divider bg-paper">
      {showBack ? (
        <button onClick={onBack} className="w-11 h-11 flex items-center justify-center shrink-0">
          <ChevronLeft size={22} className="text-ink-2 rotate-180" strokeWidth={2} />
        </button>
      ) : (
        <div className="w-11 shrink-0" />
      )}
      <div className="h-1.5 flex-1 bg-cream-warm rounded-full overflow-hidden">
        <div className="h-full bg-ink rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <button onClick={onClose} className="w-11 h-11 flex items-center justify-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center">
          <X size={16} className="text-ink-2" strokeWidth={2.5} />
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
      // fail silently
    }
    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
        <ProgressHeader progress={100} onClose={() => router.push("/profile")} showBack={false} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
          <span className="text-5xl">🙏</span>
          <p className="font-serif text-2xl font-bold text-ink text-center tracking-tight">תודה!</p>
          <p className="text-base text-ink-2 text-center">קיבלנו את המשוב שלך</p>
        </div>
        <div className="px-5 pb-12">
          <button
            onClick={() => router.push("/profile")}
            className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl active:opacity-90 flex items-center justify-center gap-2"
          >
            סגירה
          </button>
        </div>
      </div>
    );
  }

  if (step === "contact") {
    return (
      <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
        <ProgressHeader progress={progress} onBack={() => setStep("describe")} onClose={() => router.push("/profile")} showBack />
        <main className="flex-1 flex flex-col px-5 pt-10 pb-10 gap-6">
          <p className="font-serif text-xl font-bold text-ink text-right leading-snug tracking-tight">
            נשמח לשוחח כדי להבין את הבעיה ולפתור אותה.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { value: name, set: setName, placeholder: "איך קוראים לך", type: "text" },
              { value: email, set: setEmail, placeholder: "מייל", type: "email" },
              { value: phone, set: setPhone, placeholder: "טלפון נייד", type: "tel" },
            ].map(({ value, set, placeholder, type }) => (
              <input
                key={placeholder}
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full h-14 bg-paper ring-1 ring-divider rounded-2xl px-4 text-right text-sm text-ink placeholder:text-ink-3 outline-none focus:ring-terracotta"
              />
            ))}
          </div>
          <button
            onClick={submitToSupabase}
            className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl active:opacity-90 flex items-center justify-center gap-2"
          >
            סיימנו
          </button>
        </main>
      </div>
    );
  }

  if (step === "describe" && config) {
    const handleNext = () => {
      if (!description.trim()) return;
      if (config.hasContact) setStep("contact");
      else submitToSupabase();
    };

    return (
      <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
        <ProgressHeader progress={progress} onBack={() => setStep("select")} onClose={() => router.push("/profile")} showBack />
        <main className="flex-1 flex flex-col px-5 pt-10 pb-10 gap-6">
          <div className="text-right">
            <p className="font-serif text-xl font-bold text-ink mb-2 tracking-tight">{config.question}</p>
            <p className="text-sm text-ink-3 leading-relaxed whitespace-pre-line">{config.subtitle}</p>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-paper ring-1 ring-divider rounded-2xl px-4 py-3 text-sm text-ink text-right placeholder:text-ink-3 outline-none focus:ring-terracotta transition-colors resize-none"
          />
          <button
            onClick={handleNext}
            disabled={!description.trim()}
            className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl active:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity"
          >
            {config.nextLabel}
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
      <ProgressHeader progress={0} onClose={() => router.back()} showBack={false} />
      <main className="flex-1 flex flex-col justify-center px-5 pb-10 gap-5">
        <p className="font-serif text-xl font-bold text-ink text-center tracking-tight">איך נוכל לעזור לך? *</p>
        <div className="flex flex-col gap-3">
          {options.map(({ id, icon: Icon, label, color, bg }) => (
            <button
              key={id}
              onClick={() => handleSelectOption(id)}
              className="flex items-center justify-between px-5 h-16 rounded-2xl ring-1 ring-divider bg-paper active:bg-cream transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} strokeWidth={2} />
              </div>
              <span className="font-serif text-base font-semibold flex-1 text-right mr-3 text-ink">{label}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
