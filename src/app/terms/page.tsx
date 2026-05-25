"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
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

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">

      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider sticky top-0 z-10">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">תקנון ומדיניות שימוש</h1>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronLeft size={24} className="text-ink" strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 px-5 py-6 flex flex-col gap-8 pb-16">

        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-xl font-bold text-ink leading-snug tracking-tight">
            תנאי שימוש ותקנון הפלטפורמה — Hevre (חבר&apos;ה)
          </h1>
          <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">עודכן לאחרונה: מאי 2026</p>
        </div>

        <p className="text-sm text-ink-2 leading-relaxed">
          ברוכים הבאים לאפליקציית Hevre (להלן: &quot;הפלטפורמה&quot;). השימוש בפלטפורמה מותנה בהסכמתך המלאה לתנאים המפורטים להלן. אם אינך מסכים לתנאים אלו, כולם או חלקם, אינך רשאי לעשות שימוש בפלטפורמה.
        </p>

        <Section title="1. מהות הפלטפורמה">
          <p>Hevre היא פלטפורמה טכנולוגית המשמשת כלוח מודעות דיגיטלי ומערכת נטוורקינג, ומטרתה לקשר בין מחפשי עבודה לבין מעסיקים ובעלי עסקים בארצות הברית.</p>
          <Note>
            <span className="font-bold">הבהרה משפטית קריטית:</span> הפלטפורמה אינה חברת השמה, אינה מעסיקה של מי מהמשתמשים, ואינה צד לכל חוזה עבודה, הסכם או התקשרות שייווצרו בין משתמשים לבין מעסיקים.
          </Note>
        </Section>

        <Section title="2. זכאות והרשמה">
          <p>השימוש בפלטפורמה מותרת למשתמשים בני 18 ומעלה בלבד.</p>
          <p>המשתמש מתחייב לספק מידע אמיתי, מדויק ומעודכן בעת יצירת הפרופיל האישי או העסקי.</p>
          <p>חל איסור מוחלט לפתוח פרופיל פיקטיבי או להתחזות לאדם אחר או לעסק אחר.</p>
        </Section>

        <Section title="3. אחריות על חוקיות ההעסקה ואישורי עבודה (ויזות)">
          <p>האחריות הבלעדית לבדיקת חוקיות ההעסקה, החזקת ויזה מתאימה, אישורי עבודה רשמיים, תשלום מיסים וציות לחוקי העבודה של ארצות הברית חלה על המעסיק ועל מחפש העבודה בלבד.</p>
          <Note>
            הפלטפורמה אינה בודקת, אינה מאמתת ואינה לוקחת שום אחריות על סטטוס ההגירה או אישורי העבודה של המשתמשים.
          </Note>
        </Section>

        <Section title="4. חוק שקיפות השכר">
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

      </main>
    </div>
  );
}
