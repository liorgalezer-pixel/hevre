"use client";

import { use, useState, useEffect, useRef } from "react";
import { ChevronRight, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
  const [myPhone, setMyPhone] = useState("");
  const [isEmployer, setIsEmployer] = useState(false);
  const [otherName, setOtherName] = useState("שיחה");
  const [jobTitle, setJobTitle] = useState("");
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waPhone, setWaPhone] = useState("");
  const [waCountry, setWaCountry] = useState<"+972" | "+1">("+972");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMyId(user.id);

      // Load my profile
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("first_name, phone")
        .eq("id", user.id)
        .single();
      if (myProfile) {
        setMyFirstName(myProfile.first_name || "");
        setMyPhone(myProfile.phone || "");
        setWaPhone(myProfile.phone || "");
      }

      // Load conversation metadata
      const { data: convData } = await supabase
        .from("conversations")
        .select("employer_id, applicant_id, jobs(title), employer:profiles!conversations_employer_id_fkey(first_name), applicant:profiles!conversations_applicant_id_fkey(first_name)")
        .eq("id", conversationId)
        .single();

      if (convData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c = convData as any;
        setJobTitle(c.jobs?.title || "משרה");
        const emp = c.employer_id === user.id;
        setIsEmployer(emp);
        setOtherName(emp ? (c.applicant?.first_name || "מועמד") : (c.employer?.first_name || "מעסיק"));
      }

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      setMessages(msgs || []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
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
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: myId,
      content: trimmed,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Send WhatsApp link as a chat message
  const handleSendWhatsApp = async () => {
    if (!myId) return;
    if (!waPhone.replace(/\D/g, "")) return;
    const countryDigits = waCountry.replace("+", "");
    // Strip leading country code or leading 0 from local number
    let localDigits = waPhone.replace(/\D/g, "");
    if (localDigits.startsWith(countryDigits)) localDigits = localDigits.slice(countryDigits.length);
    else if (localDigits.startsWith("0")) localDigits = localDigits.slice(1);
    const digits = countryDigits + localDigits;
    const name = myFirstName || "אני";
    const waText = encodeURIComponent(`היי זה ${name} הגעתי אליך מחבר'ה`);
    const link = `https://wa.me/${digits}?text=${waText}`;
    const msgContent = `📱 לחץ לשיחה בוואטסאפ: ${link}`;
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: myId,
      content: msgContent,
    });
    setWaModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-3 flex items-center gap-3 border-b border-gray-100 shrink-0">
        <button onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center shrink-0">
          <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
        </button>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-base font-black text-blue-700">
          {otherName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{otherName}</p>
          <p className="text-xs text-gray-400 truncate">{jobTitle}</p>
        </div>
        {isEmployer && (
          <button onClick={() => setWaModalOpen(true)} className="w-11 h-11 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>
        )}
      </header>


      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-sm">שלח הודעה ראשונה 👋</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === myId;
          // Detect WhatsApp link messages
          const isWaLink = msg.content.startsWith("📱 לחץ לשיחה בוואטסאפ:");
          const waUrl = isWaLink ? msg.content.replace("📱 לחץ לשיחה בוואטסאפ: ", "") : null;

          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
              {isWaLink && waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-[75%] bg-green-500 text-white px-4 py-3 rounded-2xl flex flex-col gap-1 active:bg-green-600"
                >
                  <span className="text-sm font-bold">📱 פתח וואטסאפ</span>
                  <span className="text-xs text-green-100">לחץ לשיחה ישירה</span>
                  <p className={`text-[10px] mt-0.5 text-green-200 ${isMe ? "text-left" : "text-right"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </a>
              ) : (
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-blue-700 text-white rounded-tr-sm"
                    : "bg-white text-gray-800 shadow-sm rounded-tl-sm"
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-blue-200" : "text-gray-400"} text-left`}>
                    {new Date(msg.created_at).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-2 shrink-0">
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-11 h-11 rounded-full bg-blue-700 flex items-center justify-center shrink-0 active:bg-blue-800 disabled:opacity-40 transition-opacity"
        >
          <Send size={18} className="text-white" strokeWidth={2} />
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="הקלד הודעה..."
          rows={1}
          dir="rtl"
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-right outline-none resize-none max-h-32 leading-relaxed"
          style={{ minHeight: "44px" }}
        />
      </div>

      {/* WhatsApp modal */}
      {waModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setWaModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="bg-white rounded-t-3xl w-full px-5 pt-5 pb-10 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-1">
                <button onClick={() => setWaModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
                  <X size={18} className="text-gray-600" strokeWidth={2} />
                </button>
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
                <div className="w-9" />
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <h2 className="text-lg font-black text-gray-900">שלח קישור וואטסאפ</h2>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                  המועמד יקבל קישור לפתיחת שיחה איתך בוואטסאפ עם הודעה מובנית
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 text-right">מספר הוואטסאפ שלך</label>
                <div className="flex gap-2" style={{ direction: "ltr" }}>
                  <select
                    value={waCountry}
                    onChange={(e) => setWaCountry(e.target.value as "+972" | "+1")}
                    className="h-12 bg-gray-50 border border-gray-200 rounded-xl px-2 text-sm outline-none focus:border-green-400 shrink-0 w-24"
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
                    className="flex-1 h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-left text-base outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <button
                onClick={handleSendWhatsApp}
                disabled={!waPhone.replace(/\D/g, "")}
                className="w-full h-14 bg-green-500 text-white font-black text-base rounded-2xl active:bg-green-600 disabled:opacity-40 transition-opacity"
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
