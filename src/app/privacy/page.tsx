"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-serif text-base font-bold text-ink tracking-tight">{title}</h2>
      <div className="text-sm text-ink-2 leading-relaxed flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-warm-info-bg rounded-2xl px-4 py-3 text-sm text-warm-info-text leading-relaxed">
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5 mr-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-terracotta shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider sticky top-0 z-10">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-ink" strokeWidth={2} />
        </button>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">מדיניות פרטיות</h1>
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 flex flex-col gap-8 pb-16">

        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-xl font-bold text-ink leading-snug tracking-tight">
            מדיניות פרטיות — Hevre (חבר&apos;ה)
          </h1>
          <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">תאריך עדכון אחרון: מאי 2026</p>
        </div>

        <p className="text-sm text-ink-2 leading-relaxed">
          אפליקציית Hevre מכבדת את פרטיותם של המשתמשים שלה. מדיניות זו מפרטת את סוגי המידע שאנו אוספים, כיצד אנו משתמשים בו, משתפים אותו ומגנים עליו.
        </p>

        <Section title="1. המידע שאנו אוספים">
          <p>אנו אוספים מידע בכמה דרכים — הן מידע שאתה מספק באופן אקטיבי והן מידע שנאסף אוטומטית:</p>
          <div className="flex flex-col gap-3 mt-1">
            {[
              { title: "מידע מחשבון גוגל", body: "כתובת אימייל, שם מלא, תמונת פרופיל ציבורית" },
              { title: "מידע פרופיל אישי (מחפש עבודה)", body: "תיאור אישי, ניסיון תעסוקתי, תחומי עניין, פרטי קשר וזמינות לעבודה." },
              { title: "מידע פרופיל עסקי (מעסיק)", body: "שם העסק, לוגו, כתובת, תיאור העסק ומודעות הדרושים שפורסמו." },
              { title: "תוכן התכתבויות (Chat)", body: "הודעות וטקסטים שאתה מחליף דרך מערכת הצ'אט — נשמרים בשרתים המאובטחים שלנו לצורך רצף השיחה." },
              { title: "נתוני שימוש טכניים", body: "כתובת IP, סוג מכשיר, מערכת הפעלה ונתוני סטטיסטיקה על אופן השימוש באפליקציה." },
            ].map(({ title, body }) => (
              <div key={title} className="bg-paper rounded-2xl ring-1 ring-divider px-4 py-3 flex flex-col gap-1">
                <p className="font-semibold text-ink">{title}</p>
                <p className="text-ink-2">{body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="2. כיצד אנו משתמשים במידע שלך">
          <p>אנו משתמשים במידע שנאסף למטרות הבאות בלבד:</p>
          <BulletList items={[
            "תפעול, תחזוקה ושיפור חווית המשתמש באפליקציה.",
            "חיבור בין מחפשי עבודה למעסיקים בעת הגשת מועמדות אקטיבית.",
            "הפעלת מערכת ההודעות והצ'אט בזמן אמת.",
            "שליחת התראות על הודעות חדשות, מועמדויות או עדכונים קריטיים.",
            "מניעת הונאות, פרופילים פיקטיביים ושימוש לרעה.",
          ]} />
        </Section>

        <Section title="3. שיתוף מידע והגנת ספאם">
          <Note>
            <span className="font-bold">ההתחייבות הקהילתית שלנו:</span> אנו מתחייבים באופן חד-משמעי לא למכור, לא להשכיר ולא להעביר את פרטי הקשר שלך לצדדים שלישיים.
          </Note>
          <div className="flex flex-col gap-2 mt-1">
            <p className="font-semibold text-ink">מי רואה את המידע שלך?</p>
            <div className="bg-paper rounded-2xl ring-1 ring-divider px-4 py-3 flex flex-col gap-2">
              <p><span className="font-medium text-ink">מחפש עבודה —</span> <span className="text-ink-2">המידע גלוי רק למעסיקים שאליהם הגשת מועמדות יזומה.</span></p>
              <div className="border-t border-divider" />
              <p><span className="font-medium text-ink">מעסיק —</span> <span className="text-ink-2">פרטי המשרה והפרופיל העסקי גלויים לכלל המשתמשים.</span></p>
            </div>
            <p className="text-ink-2">ספקי שירותים חיצוניים (Supabase, Vercel, Stripe) מחויבים לשמירה קשוחה על סודיות המידע.</p>
          </div>
        </Section>

        <Section title="4. אבטחת מידע ותשלומים (Stripe)">
          <p>אנו נוקטים באמצעי אבטחה מתקדמים כולל הצפנת SSL וחוקי אבטחה ברמת בסיס הנתונים (RLS).</p>
          <Note>
            כל רכישה של מודעת פרימיום מבוצעת דרך חלון מאובטח של Stripe. פרטי כרטיס האשראי המלאים שלך אינם עוברים, נשמרים או מנוהלים בשרתים של Hevre בשום שלב.
          </Note>
        </Section>

        <Section title="5. שמירת מידע וזכות המחיקה">
          <p className="text-ink-2">המידע שלך יישמר כל עוד החשבון פעיל.</p>
          <div className="bg-paper rounded-2xl ring-1 ring-divider px-4 py-3">
            <p className="font-semibold text-ink mb-1">זכות המחיקה</p>
            <p className="text-ink-2">בכל שלב זכותך לבקש מחיקת החשבון והמידע לצמיתות — דרך הגדרות הפרופיל או בפנייה לתמיכה.</p>
          </div>
        </Section>

        <Section title="6. יצירת קשר">
          <p className="text-ink-2">לכל שאלה או בקשה בנושא פרטיות:</p>
          <div className="bg-paper rounded-2xl ring-1 ring-divider px-4 py-3">
            <p className="font-medium text-terracotta">support@hevre.app</p>
          </div>
        </Section>

      </main>
    </div>
  );
}
