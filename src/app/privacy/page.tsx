"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-black text-gray-900">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-sm text-blue-800 leading-relaxed">
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5 mr-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-base font-bold text-gray-900">מדיניות פרטיות</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={72} height={28} className="object-contain" />
      </header>

      <main className="flex-1 px-5 py-6 flex flex-col gap-8 pb-16">

        {/* Title block */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-black text-gray-900 leading-snug">
            מדיניות פרטיות — Hevre (חבר&apos;ה)
          </h1>
          <p className="text-xs text-gray-400">תאריך עדכון אחרון: מאי 2026</p>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          אפליקציית Hevre מכבדת את פרטיותם של המשתמשים שלה. מדיניות זו מפרטת את סוגי המידע שאנו אוספים, כיצד אנו משתמשים בו, משתפים אותו ומגנים עליו. בעצם הרישום והשימוש בפלטפורמה, אתה מסכים לאיסוף המידע ולשימוש בו בהתאם למדיניות זו.
        </p>

        <Section title="1. המידע שאנו אוספים">
          <p>אנו אוספים מידע בכמה דרכים — הן מידע שאתה מספק באופן אקטיבי והן מידע שנאסף אוטומטית:</p>

          <div className="flex flex-col gap-3 mt-1">
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex flex-col gap-1">
              <p className="font-semibold text-gray-800">מידע מחשבון גוגל</p>
              <BulletList items={["כתובת אימייל", "שם מלא", "תמונת פרופיל ציבורית"]} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex flex-col gap-1">
              <p className="font-semibold text-gray-800">מידע פרופיל אישי (מחפש עבודה)</p>
              <p>תיאור אישי, ניסיון תעסוקתי, תחומי עניין, פרטי קשר וזמינות לעבודה.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex flex-col gap-1">
              <p className="font-semibold text-gray-800">מידע פרופיל עסקי (מעסיק)</p>
              <p>שם העסק, לוגו, כתובת, תיאור העסק ומודעות הדרושים שפורסמו.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex flex-col gap-1">
              <p className="font-semibold text-gray-800">תוכן התכתבויות (Chat)</p>
              <p>הודעות וטקסטים שאתה מחליף דרך מערכת הצ&apos;אט — נשמרים בשרתים המאובטחים שלנו לצורך רצף השיחה.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex flex-col gap-1">
              <p className="font-semibold text-gray-800">נתוני שימוש טכניים</p>
              <p>כתובת IP, סוג מכשיר, מערכת הפעלה ונתוני סטטיסטיקה על אופן השימוש באפליקציה.</p>
            </div>
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
            <span className="font-bold">ההתחייבות הקהילתית שלנו:</span> אנו מתחייבים באופן חד-משמעי לא למכור, לא להשכיר ולא להעביר את פרטי הקשר שלך לצדדים שלישיים, חברות השמה חיצוניות או גופי שיווק.
          </Note>

          <div className="flex flex-col gap-2 mt-1">
            <p className="font-semibold text-gray-800">מי רואה את המידע שלך?</p>
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex flex-col gap-2">
              <p><span className="font-medium text-gray-700">מחפש עבודה —</span> המידע גלוי רק למעסיקים שאליהם הגשת מועמדות יזומה. הפיד הכללי אינו חושף פרטיך.</p>
              <div className="border-t border-gray-100" />
              <p><span className="font-medium text-gray-700">מעסיק —</span> פרטי המשרה והפרופיל העסקי גלויים לכלל המשתמשים כדי לאפשר פנייה אליך.</p>
            </div>
            <p>ספקי שירותים חיצוניים (Supabase, Vercel, Stripe) מחויבים לשמירה קשוחה על סודיות המידע.</p>
          </div>
        </Section>

        <Section title="4. אבטחת מידע ותשלומים (Stripe)">
          <p>אנו נוקטים באמצעי אבטחה מתקדמים כולל הצפנת SSL וחוקי אבטחה ברמת בסיס הנתונים (RLS).</p>
          <Note>
            כל רכישה של מודעת פרימיום מבוצעת דרך חלון מאובטח של Stripe. פרטי כרטיס האשראי המלאים שלך אינם עוברים, נשמרים או מנוהלים בשרתים של Hevre בשום שלב.
          </Note>
        </Section>

        <Section title="5. שמירת מידע וזכות המחיקה (GDPR)">
          <p>המידע שלך יישמר כל עוד החשבון פעיל או כל עוד יש בו צורך לצורך אספקת השירותים.</p>
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
            <p className="font-semibold text-gray-800 mb-1">זכות המחיקה</p>
            <p>בכל שלב זכותך לבקש מחיקת החשבון והמידע לצמיתות — דרך הגדרות הפרופיל (&quot;מחיקת חשבון&quot;) או בפנייה לתמיכה. כל המידע, הפרופיל והיסטוריית ההגשות יימחקו מבסיסי הנתונים הפעילים.</p>
          </div>
        </Section>

        <Section title="6. שינויים במדיניות">
          <p>אנו שומרים לעצמנו את הזכות לעדכן מדיניות זו מעת לעת. במקרה של שינויים מהותיים, נציג הודעה בולטת באפליקציה או נשלח עדכון באימייל. המשך השימוש לאחר העדכון מהווה הסכמה למדיניות המעודכנת.</p>
        </Section>

        <Section title="7. יצירת קשר">
          <p>לכל שאלה או בקשה בנושא פרטיות, ניתן לפנות אלינו ישירות:</p>
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
            <p className="font-medium text-blue-700">support@hevre.app</p>
          </div>
        </Section>

      </main>
    </div>
  );
}
