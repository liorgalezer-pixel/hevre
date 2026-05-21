"use client";

import { useState, useEffect } from "react";
import { ChevronRight, MessageCircle, Archive, ArchiveRestore } from "lucide-react";
import Image from "next/image";
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

      const { data: convs } = await supabase
        .from("conversations")
        .select("id, job_id, employer_id, applicant_id, created_at, jobs(title), employer:profiles!conversations_employer_id_fkey(first_name), applicant:profiles!conversations_applicant_id_fkey(first_name)")
        .order("created_at", { ascending: false });

      const { data: lastMsgs } = await supabase
        .from("messages")
        .select("conversation_id, content, created_at")
        .in("conversation_id", (convs || []).map((c: { id: string }) => c.id))
        .order("created_at", { ascending: false });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lastByConv: Record<string, any> = {};
      (lastMsgs || []).forEach((m: { conversation_id: string; content: string; created_at: string }) => {
        if (!lastByConv[m.conversation_id]) lastByConv[m.conversation_id] = m;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: Conversation[] = (convs || []).map((c: any) => {
        const isEmployer = c.employer_id === user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const otherProfile: any = isEmployer ? c.applicant : c.employer;
        const last = lastByConv[c.id];
        return {
          id: c.id,
          job_title: c.jobs?.title || "משרה",
          other_name: otherProfile?.first_name || "משתמש",
          last_message: last?.content || "שיחה חדשה",
          last_at: last?.created_at || c.created_at,
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
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">הודעות</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5 pb-24">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-black text-gray-900">יש להתחבר כדי לצפות בהודעות</h2>
        <p className="text-sm text-gray-400">התחבר או צור חשבון כדי לנהל את ההודעות שלך</p>
        <Link href="/login" className="w-full h-14 bg-blue-700 text-white font-bold text-base rounded-2xl flex items-center justify-center active:bg-blue-800 transition-colors">
          התחבר / הרשם
        </Link>
      </main>
      <BottomNav />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">הודעות</h1>
        <Image src="/hevre-logo.png" alt="Hevre" width={80} height={32} className="object-contain" />
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white">
        <button
          onClick={() => setShowArchive(false)}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${!showArchive ? "text-blue-700 border-b-2 border-blue-700" : "text-gray-400"}`}
        >
          שיחות
        </button>
        <button
          onClick={() => setShowArchive(true)}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${showArchive ? "text-blue-700 border-b-2 border-blue-700" : "text-gray-400"}`}
        >
          <Archive size={14} strokeWidth={2} />
          ארכיון {archived.length > 0 && `(${archived.length})`}
        </button>
      </div>

      <main className="flex-1 pb-24">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-24 px-8 text-center gap-4">
            <MessageCircle size={52} className="text-gray-200" strokeWidth={1.2} />
            <h2 className="text-lg font-black text-gray-700">
              {showArchive ? "הארכיון ריק" : "אין צ׳אטים עדיין"}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              {showArchive ? "שיחות שתארכב יופיעו כאן" : "ברגע שעסק יקבל את המועמדות שלך, תיפתח כאן שיחה"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {visible.map((conv) => (
              <div
                key={conv.id}
                onClick={() => router.push(`/messages/${conv.id}`)}
                className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 active:bg-gray-50 text-right cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-lg font-black text-blue-700">
                  {conv.other_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(conv.last_at).toLocaleDateString("he-IL")}
                    </span>
                    <p className="text-sm font-bold text-gray-900 truncate">{conv.other_name}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate text-right mt-0.5">{conv.job_title}</p>
                  <p className="text-xs text-gray-400 truncate text-right mt-0.5">{conv.last_message}</p>
                </div>
                <button
                  onClick={(e) => toggleArchive(e, conv.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100 shrink-0"
                  title={archived.includes(conv.id) ? "הוצא מארכיון" : "העבר לארכיון"}
                >
                  {archived.includes(conv.id)
                    ? <ArchiveRestore size={18} className="text-blue-500" strokeWidth={1.8} />
                    : <Archive size={18} className="text-gray-400" strokeWidth={1.8} />
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
