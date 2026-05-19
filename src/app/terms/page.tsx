"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
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

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-base font-bold text-gray-900">תקנון ומדיניות פרטיות</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={72} height={28} className="object-contain" />
      </header>

      <main className="flex-1 px-5 py-6 flex flex-col gap-8 pb-16">

        {/* Title block */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-black text-gray-900 leading-snug">
            תנאי שימוש ותקנון הפלטפורמה — Hevre (חבר&apos;ה)
          </h1>
          <p className="text-xs text-gray-400">עודכן לאחרונה: מאי 2026</p>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          ברוכים הבאים לאפליקציית Hevre (להלן: &quot;הפלטפורמה&quot;). השימוש בפלטפורמה מותנה בהסכמתך המלאה לתנאים המפורטים להלן. אם אינך מסכים לתנאים אלו, כולם או חלקם, אינך רשאי לעשות שימוש בפלטפורמה.
        </p>

        {/* Terms sections */}
        <Section title="1. מהות הפלטפורמה">
          <p>Hevre היא פלטפורמה טכנולוגית המשמשת כלוח מודעות דיגיטלי ומערכת נטוורקינג, ומטרתה לקשר בין מחפשי עבודה לבין מעסיקים ובעלי עסקים בניו יורק.</p>
          <Note>
            <span className="font-bold">הבהרה משפטית קריטית:</span> הפלטפורמה אינה חברת השמה, אינה מעסיקה של מי מהמשתמשים, ואינה צד לכל חוזה עבודה, הסכם או התקשרות שייווצרו בין משתמשים לבין מעסיקים.
          </Note>
        </Section>

        <Section title="2. זכאות והרשמה">
          <p>השימוש בפלטפורמה מותר למשתמשים בני 18 ומעלה בלבד.</p>
          <p>המשתמש מתחייב לספק מידע אמיתי, מדויק ומעודכן בעת יצירת הפרופיל האישי או העסקי.</p>
          <p>חל איסור מוחלט לפתוח פרופיל פיקטיבי או להתחזות לאדם אחר או לעסק אחר.</p>
        </Section>

        <Section title="3. אחריות על חוקיות ההעסקה ואישורי עבודה (ויזות)">
          <p>האחריות הבלעדית לבדיקת חוקיות ההעסקה, החזקת ויזה מתאימה, אישורי עבודה רשמיים, תשלום מיסים וציות לחוקי העבודה של מדינת ניו יורק וארצות הברית חלה על המעסיק ועל מחפש העבודה בלבד.</p>
          <Note>
            הפלטפורמה אינה בודקת, אינה מאמתת ואינה לוקחת שום אחריות על סטטוס ההגירה או אישורי העבודה של המשתמשים.
          </Note>
        </Section>

        <Section title="4. חוק שקיפות השכר בניו יורק">
          <p>מעסיקים המפרסמים משרות בפלטפורמה מתחייבים לפעול בהתאם לחוק המקומי ולציין טווח שכר ברור ואמיתי בכל מודעה.</p>
          <p>חל איסור לפרסם מודעות מטעות או מודעות המציגות נתוני שכר כוזבים.</p>
        </Section>

        <Section title="5. מגבלות תוכן ופרסום">
          <p>חל איסור מוחלט לפרסם בפלטפורמה:</p>
          <ul className="list-disc list-inside flex flex-col gap-1 mr-2">
            <li>תוכן פוגעני, גזעני, אלים, או כזה המעודד פעילות בלתי חוקית.</li>
            <li>מודעות גיוס המהוות הונאה, שיווק רשתי (MLM), או מודעות הדורשות תשלום ממחפש העבודה.</li>
          </ul>
          <p>הפלטפורמה שומרת לעצמה את הזכות למחוק כל מודעה, לחסום משתמש או להסיר פרופיל על פי שיקול דעתה הבלעדי.</p>
        </Section>

        <Section title="6. הגבלת אחריות">
          <p>הפלטפורמה, מקימיה ומעיליה אינם אחראים לתוכן המודעות, לאמינות המעסיקים, להתנהגות המשתמשים, או לכל נזק, הפסד, או עוגמת נפש שייגרמו כתוצאה מאינטראקציה שהתחילה בפלטפורמה.</p>
        </Section>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6 flex flex-col gap-1">
          <h1 className="text-xl font-black text-gray-900">מדיניות פרטיות</h1>
          <p className="text-xs text-gray-400">Privacy Policy</p>
        </div>

        <Section title="1. המידע שאנו אוספים">
          <p><span className="font-semibold text-gray-800">מידע הרשמה:</span> בעת התחברות באמצעות גוגל, אנו מקבלים גישה לשם מלא, כתובת אימייל ותמונת פרופיל.</p>
          <p><span className="font-semibold text-gray-800">מידע פרופיל:</span> כל מידע שתבחר להוסיף — ניסיון, תחומי עניין, תיאור העסק, לוגו.</p>
          <p><span className="font-semibold text-gray-800">התכתבויות:</span> תוכן ההודעות בצ&apos;אט נשמר בבסיס הנתונים המאובטח שלנו לצורך פעילות השרות.</p>
        </Section>

        <Section title="2. שימוש במידע">
          <p>אנו משתמשים במידע שלך אך ורק כדי:</p>
          <ul className="list-disc list-inside flex flex-col gap-1 mr-2">
            <li>להפעיל את האפליקציה ולאפשר יצירת קשר בין מעסיקים לעובדים.</li>
            <li>לשלוח התראות רלוונטיות על הודעות חדשות או מועמדויות.</li>
            <li>לשפר את חווית השימוש ולמנוע הונאות.</li>
          </ul>
        </Section>

        <Section title="3. העברת מידע לצד ג׳">
          <Note>
            <span className="font-bold">הבטחה חברתית:</span> אנו ב-Hevre מתחייבים לא למכור, לא להשכיר ולא להעביר את פרטי הקשר שלך לאף חברה חיצונית למטרות שיווקיות.
          </Note>
          <p>פרטי הפרופיל יוצגו למעסיקים אך ורק כאשר תבחר להגיש מועמדות למשרה באופן אקטיבי.</p>
        </Section>

        <Section title="4. סליקה ותשלומים (Stripe)">
          <p>כל עיבוד התשלומים עבור מודעות פרימיום מבוצע בצורה מאובטחת ומוצפנת דרך חברת Stripe.</p>
          <p>פרטי כרטיס האשראי שלך אינם נשמרים בשרתים של Hevre בשום שלב.</p>
        </Section>

      </main>
    </div>
  );
}
