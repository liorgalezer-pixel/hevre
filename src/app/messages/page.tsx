"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, MessageCircle, Archive, Trash2, ArchiveRestore } from "lucide-react";
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

function PersonAvatar({ name, size = 48 }: { name: string; size?: number }) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = (hash * 47) % 360;
  return (
    <div
      style={{ width: size, height: size, background: `oklch(0.94 0.04 ${hue})`, color: `oklch(0.45 0.13 ${hue})` }}
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
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

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

  const archiveConv = (convId: string) => {
    setArchived(prev => {
      const next = prev.includes(convId) ? prev.filter(id => id !== convId) : [...prev, convId];
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(next));
      return next;
    });
    setSwipedId(null);
  };

  const deleteConv = async () => {
    if (!deleteTarget) return;
    await supabase.from("conversations").delete().eq("id", deleteTarget);
    setConversations(prev => prev.filter(c => c.id !== deleteTarget));
    setArchived(prev => {
      const next = prev.filter(id => id !== deleteTarget);
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(next));
      return next;
    });
    setDeleteTarget(null);
  };

  const handleTouchStart = (e: React.TouchEvent, convId: string) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    if (swipedId && swipedId !== convId) setSwipedId(null);
  };

  const handleTouchEnd = (e: React.TouchEvent, convId: string) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (deltaY > 30) return;
    if (deltaX < -60) setSwipedId(convId);
    else if (deltaX > 20) setSwipedId(null);
  };

  const visible = conversations.filter(c =>
    showArchive ? archived.includes(c.id) : !archived.includes(c.id)
  );

  if (!loaded) return null;

  if (!isLoggedIn) return (
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl">
      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">הודעות</h1>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronLeft size={24} className="text-ink" strokeWidth={2} />
        </button>
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
    <div className="flex flex-col min-h-screen bg-cream" dir="rtl" onClick={() => swipedId && setSwipedId(null)}>
      <header className="bg-paper px-4 pt-12 pb-4 flex items-center justify-between border-b border-divider">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-lg font-bold text-ink tracking-tight">Hevre</span>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta self-center" />
        </div>
        <h1 className="font-serif text-lg font-bold text-ink tracking-tight">הודעות</h1>
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronLeft size={24} className="text-ink" strokeWidth={2} />
        </button>
      </header>

      {/* Tabs — 80% / 20% */}
      <div className="flex border-b border-divider bg-paper">
        <button
          onClick={() => setShowArchive(false)}
          className={`py-3 font-serif text-sm font-semibold transition-colors relative ${!showArchive ? "text-terracotta" : "text-ink-3"}`}
          style={{ width: "80%" }}
        >
          שיחות
          {!showArchive && <span className="absolute bottom-[-1px] left-[20%] right-[20%] h-0.5 bg-terracotta" />}
        </button>
        <button
          onClick={() => setShowArchive(true)}
          className={`py-3 flex items-center justify-center relative transition-colors ${showArchive ? "text-terracotta" : "text-ink-3"}`}
          style={{ width: "20%" }}
        >
          <div className="relative">
            <Archive size={18} strokeWidth={2} />
            {archived.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-terracotta rounded-full text-[8px] font-black text-white flex items-center justify-center">
                {archived.length}
              </span>
            )}
          </div>
          {showArchive && <span className="absolute bottom-[-1px] left-[10%] right-[10%] h-0.5 bg-terracotta" />}
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
            {visible.map((conv) => {
              const isArchived = archived.includes(conv.id);
              const isSwiped = swipedId === conv.id;
              return (
                <div key={conv.id} className="relative overflow-hidden border-b border-divider">
                  {/* Action buttons revealed on swipe */}
                  <div className="absolute inset-y-0 right-0 flex">
                    <button
                      onClick={(e) => { e.stopPropagation(); archiveConv(conv.id); }}
                      className="w-20 flex flex-col items-center justify-center gap-1 bg-warm-info-bg active:opacity-80"
                    >
                      {isArchived
                        ? <ArchiveRestore size={20} className="text-warm-info-text" strokeWidth={1.8} />
                        : <Archive size={20} className="text-warm-info-text" strokeWidth={1.8} />
                      }
                      <span className="text-[10px] text-warm-info-text font-semibold">
                        {isArchived ? "שחזר" : "ארכיון"}
                      </span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSwipedId(null); setDeleteTarget(conv.id); }}
                      className="w-20 flex flex-col items-center justify-center gap-1 bg-warm-danger-bg active:opacity-80"
                    >
                      <Trash2 size={20} className="text-warm-danger" strokeWidth={1.8} />
                      <span className="text-[10px] text-warm-danger font-semibold">מחיקה</span>
                    </button>
                  </div>

                  {/* Main row */}
                  <div
                    className="flex items-center gap-3 px-4 py-4 bg-paper text-right cursor-pointer"
                    style={{ transform: isSwiped ? "translateX(-160px)" : "translateX(0)", transition: "transform 0.25s ease" }}
                    onClick={() => isSwiped ? setSwipedId(null) : router.push(`/messages/${conv.id}`)}
                    onTouchStart={(e) => handleTouchStart(e, conv.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, conv.id)}
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-paper rounded-3xl w-full max-w-sm p-6 flex flex-col gap-5 shadow-2xl" dir="rtl">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-warm-danger-bg flex items-center justify-center">
                  <Trash2 size={24} className="text-warm-danger" strokeWidth={1.8} />
                </div>
                <h2 className="font-serif text-lg font-bold text-ink tracking-tight">מחיקת שיחה</h2>
                <p className="text-sm text-ink-2 leading-relaxed">ברגע שתמחק את הצ׳אט לא תוכל לחזור אליו. אתה בטוח?</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 h-12 rounded-2xl bg-cream font-semibold text-sm text-ink active:opacity-80"
                >
                  ביטול
                </button>
                <button
                  onClick={deleteConv}
                  className="flex-1 h-12 rounded-2xl bg-warm-danger text-white font-semibold text-sm active:opacity-80"
                >
                  מחק
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
