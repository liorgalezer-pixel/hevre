"use client";

import { use, useState, useEffect, useRef } from "react";
import { ChevronRight, Send } from "lucide-react";
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
  const [otherName, setOtherName] = useState("שיחה");
  const [jobTitle, setJobTitle] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMyId(user.id);

      // Load conversation metadata
      const { data: conv } = await supabase
        .from("conversations")
        .select("employer_id, applicant_id, jobs(title), employer:profiles!conversations_employer_id_fkey(first_name), applicant:profiles!conversations_applicant_id_fkey(first_name)")
        .eq("id", conversationId)
        .single();

      if (conv) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c = conv as any;
        setJobTitle(c.jobs?.title || "משרה");
        const isEmployer = c.employer_id === user.id;
        setOtherName(isEmployer ? (c.applicant?.first_name || "מועמד") : (c.employer?.first_name || "מעסיק"));
      }

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      setMessages(msgs || []);
    })();
  }, [conversationId, router]);

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

  // Scroll to bottom on new message
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
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
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
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-2 shrink-0 pb-safe">
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
    </div>
  );
}
