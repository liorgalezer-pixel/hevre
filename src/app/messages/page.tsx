"use client";

import { useState, useEffect } from "react";
import { ChevronRight, MessageCircle, Archive, ArchiveRestore } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

const ARCHIVE_KEY = "hevre_archived_convs";

type Conversation = {
  id: string;
  job_title: string;
  other_name: string;
  last_message: string;
  last_at: string;
};

/* Stable pastel avatar from name — replaces hard-coded blue */
function PersonAvatar({ name, size = 48 }: { name: string; size?: number }) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = (hash * 47) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        background: `oklch(0.94 0.04 ${hue})`,
        color: `oklch(0.45 0.13 ${hue})`,
      }}
      className="rounded-full flex items-center justify-center font-serif font-bold shrink-0"
    >
      <span style={{ fontSize: size * 0.42 }}>{name[0]}</span>
    </div>
  );
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [archived, setArchived] = useState<string[]>([]);
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ARCHIVE_KEY);
    if (stored) setArchived(JSON.parse(stored));
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoggedIn(false); setLoaded(true); return; }
      setIsLoggedIn(true);
      localStorage.setItem("hevre_messages_last_seen", new Date().toISOString());

      const { data: convs } = await supabase
        .from("conversations")
        .select("id, job_id, employer_id, applicant_id, created_at, jobs(title), employer:profiles!conversations_employer_id_fkey(first_name), applicant:profiles!conversations_applicant_id_fkey(first_name), messages(content, created_at)")
        .order("created_at", { ascending: false });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: Conversation[] = (convs || []).map((c: any) => {
        const isEmployer = c.employer_id === user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const otherProfile: any = isEmployer ? c.applicant : c.employer;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lastMsg = (c.messages || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        return {
          id: c.id,
          job_title: c.jobs?.title || "משרה",
          other_name: otherProfile?.first_name || "משתמש",
          last_message: lastMsg?.content || "שיחה חדשה",
          last_at: lastMsg?.created_at || c.created_at,
        };
      });
      setConversations(mapped);
      setLoaded(true);
    })();
  }, []);

  const toggleArchive = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    setArchived(prev => {
      const next = prev.includes(convId)
        ? prev.filter(id => id !== convId)
        : [...prev, convId];
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const visible = conversations.filter(c =>
    showArchive ? archived.includes(c.id) : !archived.includes(c.id)
  );

  if (!loaded) return null;

  if (!isLoggedIn) return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-ink" strokeWidth={2} />
        </button>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">הודעות</h1>
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5 pb-24">
        <div className="text-5xl">🔒</div>
        <h2 className="font-serif text-2xl font-bold text-ink tracking-tight">יש להתחבר כדי לצפות בהודעות</h2>
        <p className="text-sm text-ink-3">התחבר או צור חשבון כדי לנהל את ההודעות שלך</p>
        <Link href="/login" className="w-full h-14 bg-ink text-cream font-serif font-semibold text-base rounded-2xl flex items-center justify-center active:opacity-90 transition-opacity">
          התחבר / הירשם
        </Link>
      </main>
      <BottomNav />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-ink" strokeWidth={2} />
        </button>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">הודעות</h1>
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-divider bg-paper">
        <button
          onClick={() => setShowArchive(false)}
          className={`flex-1 py-3 font-serif text-sm font-semibold transition-colors relative ${!showArchive ? "text-terracotta" : "text-ink-3"}`}
        >
          שיחות
          {!showArchive && <span className="absolute bottom-[-1px] left-[30%] right-[30%] h-0.5 bg-terracotta" />}
        </button>
        <button
          onClick={() => setShowArchive(true)}
          className={`flex-1 py-3 font-serif text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors relative ${showArchive ? "text-terracotta" : "text-ink-3"}`}
        >
          <Archive size={14} strokeWidth={2} />
          ארכיון {archived.length > 0 && `(${archived.length})`}
          {showArchive && <span className="absolute bottom-[-1px] left-[30%] right-[30%] h-0.5 bg-terracotta" />}
        </button>
      </div>

      <main className="flex-1 pb-24">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-24 px-8 text-center gap-4">
            <MessageCircle size={52} className="text-ink-3 opacity-40" strokeWidth={1.2} />
            <h2 className="font-serif text-lg font-bold text-ink tracking-tight">
              {showArchive ? "הארכיון ריק" : "אין צ׳אטים עדיין"}
            </h2>
            <p className="text-sm text-ink-3 leading-relaxed">
              {showArchive ? "שיחות שתארכב יופיעו כאן" : "ברגע שעסק יקבל את המועמדות שלך, תיפתח כאן שיחה"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {visible.map((conv) => (
              <div
                key={conv.id}
                onClick={() => router.push(`/messages/${conv.id}`)}
                className="flex items-center gap-3 px-4 py-4 bg-paper border-b border-divider active:bg-cream text-right cursor-pointer"
              >
                <PersonAvatar name={conv.other_name} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-ink-3 shrink-0 tracking-wider">
                      {new Date(conv.last_at).toLocaleDateString("he-IL")}
                    </span>
                    <p className="font-serif text-sm font-semibold text-ink truncate">{conv.other_name}</p>
                  </div>
                  <p className="font-mono text-[10px] text-terracotta truncate text-right mt-0.5 font-semibold tracking-wider uppercase">{conv.job_title}</p>
                  <p className="text-xs text-ink-2 truncate text-right mt-1">{conv.last_message}</p>
                </div>
                <button
                  onClick={(e) => toggleArchive(e, conv.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-full active:bg-cream-warm shrink-0"
                  title={archived.includes(conv.id) ? "הוצא מארכיון" : "העבר לארכיון"}
                >
                  {archived.includes(conv.id)
                    ? <ArchiveRestore size={18} className="text-terracotta" strokeWidth={1.8} />
                    : <Archive size={18} className="text-ink-3" strokeWidth={1.8} />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
