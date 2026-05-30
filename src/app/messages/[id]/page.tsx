"use client";

import { use, useState, useEffect, useRef } from "react";
import { ChevronRight, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import posthog from "posthog-js";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: conversationId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [myFirstName, setMyFirstName] = useState("");
  const [isEmployer, setIsEmployer] = useState(false);
  const [otherName, setOtherName] = useState("שיחה");
  const [jobTitle, setJobTitle] = useState("");
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waPhone, setWaPhone] = useState("");
  const [waCountry, setWaCountry] = useState<"+972" | "+1">("+972");
  const [isClosed, setIsClosed] = useState(false);
  const [disconnectModal, setDisconnectModal] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMyId(user.id);
      localStorage.setItem("hevre_messages_last_seen", new Date().toISOString());

      // Fire cleanup in background (non-critical)
      const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
      supabase.from("messages").delete().eq("conversation_id", conversationId).lt("created_at", cutoff);

      // Fetch profile, conversation data, and messages in parallel
      const [profileRes, convRes, msgsRes] = await Promise.all([
        supabase.from("profiles").select("first_name, phone").eq("id", user.id).single(),
        supabase.from("conversations")
          .select("employer_id, applicant_id, job_id, closed_at, jobs(title), employer:profiles!conversations_employer_id_fkey(first_name), applicant:profiles!conversations_applicant_id_fkey(first_name)")
          .eq("id", conversationId).single(),
        supabase.from("messages").select("id, sender_id, content, created_at")
          .eq("conversation_id", conversationId).order("created_at", { ascending: true }),
      ]);

      const myProfile = profileRes.data;
      const googleName = (user.user_metadata?.full_name as string || user.user_metadata?.name as string || "").split(" ")[0];
      const firstName = myProfile?.first_name || googleName || user.email?.split("@")[0] || "";
      setMyFirstName(firstName);

      if (myProfile?.phone) {
        const raw = myProfile.phone.replace(/\D/g, "");
        if (raw.startsWith("972")) { setWaCountry("+972"); setWaPhone(raw.slice(3)); }
        else if (raw.startsWith("1")) { setWaCountry("+1"); setWaPhone(raw.slice(1)); }
        else { setWaPhone(raw); }
      }

      if (convRes.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c = convRes.data as any;
        setJobTitle(c.jobs?.title || "משרה");
        setJobId(c.job_id);
        if (c.closed_at) setIsClosed(true);
        const emp = c.employer_id === user.id;
        setIsEmployer(emp);
        setRecipientId(emp ? c.applicant_id : c.employer_id);
        setOtherName(emp ? (c.applicant?.first_name || "מועמד") : (c.employer?.first_name || "מעסיק"));
      }

      setMessages(msgsRes.data || []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    const channel = supabase.channel(`chat:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => setMessages(prev => [...prev, payload.new as Message]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !myId) return;
    setText("");
    await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: myId, content: trimmed });
    posthog.capture("chat_message_sent", { sender_type: isEmployer ? "employer" : "seeker", room_id: conversationId });
    if (recipientId) {
      fetch("https://eywrpbhgvuuupyunalaq.supabase.co/functions/v1/smart-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "chat", recipient_id: recipientId, sender_name: myFirstName || "מישהו", job_title: jobTitle }),
      }).catch(() => {});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleDisconnect = async () => {
    if (!myId) return;
    setDisconnecting(true);
    const closingMsg = isEmployer
      ? `🚫 המעסיק סיים את השיחה — ${jobTitle}`
      : `🚫 המועמד ביטל את המועמדות — ${jobTitle}`;
    await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: myId, content: closingMsg });
    await supabase.from("conversations").update({ closed_at: new Date().toISOString() }).eq("id", conversationId);
    if (!isEmployer && jobId) {
      await supabase.from("applications").delete().eq("job_id", jobId).eq("applicant_id", myId);
    }
    setIsClosed(true);
    setDisconnectModal(false);
    setDisconnecting(false);
  };

  const handleSendWhatsApp = async () => {
    if (!myId || !waPhone.replace(/\D/g, "")) return;
    const digits = waCountry.replace("+", "") + waPhone.replace(/\D/g, "");
    const name = myFirstName || "אני";
    const waText = encodeURIComponent(`היי זה ${name} הגעתי אליך מחבר'ה`);
    const link = `https://wa.me/${digits}?text=${waText}`;
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: myId,
      content: `📱 לחץ לשיחה בוואטסאפ: ${link}`,
    });
    setWaModalOpen(false);
  };

  // Avatar initials
  const avatarLetter = otherName[0] ?? "?";

  return (
    <div className="flex flex-col h-screen bg-cream" dir="rtl">

      {/* Header + Security notice — sticky together */}
      <div className="sticky top-0 z-10 shrink-0">
        <header className="bg-paper px-4 pb-3 flex items-center gap-3 border-b border-divider" style={{ paddingTop: "max(48px, env(safe-area-inset-top))" }}>
          <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center shrink-0">
            <ChevronRight size={24} className="text-ink-2" strokeWidth={2} />
          </button>
          <div className="w-10 h-10 rounded-full bg-cream-warm flex items-center justify-center shrink-0 font-serif font-bold text-base text-terracotta">
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm font-bold text-ink truncate tracking-tight">{otherName}</p>
            <p className="text-xs text-ink-3 truncate">{jobTitle}</p>
          </div>
          {!isClosed && (
            <button onClick={() => setDisconnectModal(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-warm-danger-bg shrink-0">
              <X size={16} className="text-warm-danger" strokeWidth={2.5} />
            </button>
          )}
          {isEmployer && !isClosed && (
            <button onClick={() => setWaModalOpen(true)} className="w-11 h-11 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
          )}
        </header>
        <div className="bg-cream-warm px-4 py-2 text-center border-b border-divider">
          <p className="font-mono text-[10px] text-ink-3 uppercase tracking-wide">🔒 לצורכי אבטחה ההודעות ימחקו תוך 72 שעות</p>
        </div>
      </div>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">👋</span>
              <p className="text-ink-3 text-sm">שלח הודעה ראשונה</p>
            </div>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === myId;
          const isWaLink = msg.content.startsWith("📱 לחץ לשיחה בוואטסאפ:");
          const waUrl = isWaLink ? msg.content.replace("📱 לחץ לשיחה בוואטסאפ: ", "") : null;
          const timeStr = new Date(msg.created_at).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
              {isWaLink && waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-[75%] bg-[#25D366] text-white px-4 py-3 rounded-2xl flex flex-col gap-1 active:opacity-90"
                >
                  <span className="text-sm font-bold">📱 פתח וואטסאפ</span>
                  <span className="text-xs text-white/70">לחץ לשיחה ישירה</span>
                  <p className={`text-[10px] mt-0.5 text-white/50 ${isMe ? "text-left" : "text-right"}`}>{timeStr}</p>
                </a>
              ) : (
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-ink text-cream rounded-tr-sm"
                    : "bg-paper text-ink ring-1 ring-divider rounded-tl-sm"
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-left ${isMe ? "text-cream/40" : "text-ink-3"}`}>{timeStr}</p>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      {/* Closed banner */}
      {isClosed && (
        <div className="bg-warm-danger-bg border-t border-warm-danger-border px-4 py-3 text-center shrink-0">
          <p className="text-warm-danger text-sm font-semibold">🚫 השיחה נסגרה — לא ניתן לשלוח הודעות</p>
        </div>
      )}

      {/* Input */}
      <div className={`bg-paper border-t border-divider px-4 py-3 flex items-end gap-2 shrink-0 ${isClosed ? "opacity-40 pointer-events-none" : ""}`}>
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-11 h-11 rounded-full bg-terracotta flex items-center justify-center shrink-0 active:opacity-90 disabled:opacity-30 transition-opacity"
        >
          <Send size={18} className="text-cream" strokeWidth={2} />
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="הקלד הודעה..."
          rows={1}
          dir="rtl"
          className="flex-1 bg-cream ring-1 ring-divider rounded-2xl px-4 py-2.5 text-sm text-right outline-none resize-none max-h-32 leading-relaxed focus:ring-terracotta transition-colors placeholder:text-ink-3 text-ink"
          style={{ minHeight: "44px" }}
        />
      </div>

      {/* Disconnect confirmation modal */}
      {disconnectModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => !disconnecting && setDisconnectModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6" dir="rtl">
            <div className="bg-paper rounded-3xl w-full max-w-sm p-6 flex flex-col gap-5 shadow-2xl">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-warm-danger-bg flex items-center justify-center">
                  <X size={26} className="text-warm-danger" strokeWidth={2} />
                </div>
                <h2 className="font-serif text-lg font-bold text-ink tracking-tight">סיום השיחה</h2>
                <p className="text-sm text-ink-2 leading-relaxed">
                  האם אתה בטוח שאתה רוצה לסיים את השיחה?<br />
                  <span className="text-warm-danger font-medium">לא ניתן יהיה לשלוח הודעות לאחר מכן.</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDisconnectModal(false)} disabled={disconnecting} className="flex-1 h-12 rounded-2xl bg-cream font-semibold text-sm text-ink">לא</button>
                <button onClick={handleDisconnect} disabled={disconnecting} className="flex-1 h-12 rounded-2xl bg-warm-danger text-white font-semibold text-sm flex items-center justify-center">
                  {disconnecting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "כן, סיים"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* WhatsApp modal */}
      {waModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setWaModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="bg-paper rounded-t-3xl w-full px-5 pt-5 pb-10 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-1">
                <button onClick={() => setWaModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-cream-warm active:bg-cream">
                  <X size={18} className="text-ink-2" strokeWidth={2} />
                </button>
                <div className="w-10 h-1 bg-cream-warm rounded-full" />
                <div className="w-9" />
              </div>

              <div className="text-center flex flex-col gap-1">
                <div className="text-3xl mb-1">📱</div>
                <h2 className="font-serif text-lg font-bold text-ink tracking-tight">שלח קישור וואטסאפ</h2>
                <p className="text-sm text-ink-2 leading-relaxed">
                  המועמד יקבל קישור לפתיחת שיחה איתך בוואטסאפ
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] text-ink-3 uppercase tracking-wider text-right">מספר הוואטסאפ שלך</label>
                <div className="flex gap-2" style={{ direction: "ltr" }}>
                  <select
                    value={waCountry}
                    onChange={(e) => setWaCountry(e.target.value as "+972" | "+1")}
                    className="h-12 bg-cream ring-1 ring-divider rounded-xl px-2 text-sm outline-none focus:ring-terracotta shrink-0 w-24 text-ink"
                  >
                    <option value="+972">🇮🇱 +972</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>
                  <input
                    type="tel"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="0501234567"
                    dir="ltr"
                    className="flex-1 h-12 bg-cream ring-1 ring-divider rounded-xl px-4 text-left text-base outline-none focus:ring-terracotta text-ink placeholder:text-ink-3"
                  />
                </div>
              </div>

              <button
                onClick={handleSendWhatsApp}
                disabled={!waPhone.replace(/\D/g, "")}
                className="w-full h-14 bg-[#25D366] text-white font-serif font-semibold text-base rounded-2xl active:opacity-90 disabled:opacity-40 transition-opacity"
              >
                שלח קישור למועמד
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
