"use client";

import { Home, PlusCircle, Heart, User, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { X } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handlePostClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/post?new=1"); return; }
    const { count } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("created_by", user.id);
    if ((count ?? 0) >= 2) {
      setShowLimitModal(true);
    } else {
      router.push("/post?new=1");
    }
  };

  const leftTabs = [
    { href: "/", icon: Home, label: "דף הבית", isHeart: false },
  ];

  const rightTabs = [
    { href: "/saved", icon: Heart, label: "אהבתי", isHeart: true },
    { href: "/profile", icon: User, label: "אזור אישי", isHeart: false },
  ];

  const isPostActive = pathname.startsWith("/post");

  const renderTab = ({ href, icon: Icon, label, isHeart }: { href: string; icon: React.ElementType; label: string; isHeart: boolean }) => {
    const active = pathname === href;
    return (
      <Link key={href} href={href} className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 min-w-[44px]">
        <Icon size={24} className={active ? "text-terracotta" : "text-ink-3"} strokeWidth={active ? 2.4 : 1.8} fill={active && isHeart ? "currentColor" : "none"} />
        <span className={`text-[10px] font-medium ${active ? "text-terracotta" : "text-ink-3"}`}>{label}</span>
      </Link>
    );
  };

  return (
    <>
      <nav className="fixed bottom-0 right-0 left-0 z-50 bg-paper border-t border-divider safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {leftTabs.map(renderTab)}

          {/* Post button */}
          <button onClick={handlePostClick} className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 min-w-[44px]">
            <PlusCircle size={24} className={isPostActive ? "text-terracotta" : "text-ink-3"} strokeWidth={isPostActive ? 2.4 : 1.8} />
            <span className={`text-[10px] font-medium ${isPostActive ? "text-terracotta" : "text-ink-3"}`}>פרסום</span>
          </button>

          {rightTabs.map(renderTab)}
        </div>
      </nav>

      {/* Limit modal */}
      {showLimitModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setShowLimitModal(false)} />
          <div className="fixed inset-0 z-[70] flex items-end justify-center pb-8 px-5">
            <div className="bg-paper rounded-3xl w-full overflow-hidden shadow-2xl">
              <div className="bg-terracotta px-6 pt-6 pb-8 flex flex-col items-center gap-3 relative">
                <button onClick={() => setShowLimitModal(false)} className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 active:bg-white/30">
                  <X size={16} className="text-cream" strokeWidth={2.5} />
                </button>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">✦</div>
                <p className="font-serif text-xl font-bold text-cream tracking-tight">Hevre+</p>
              </div>
              <div className="px-6 py-6 flex flex-col gap-4 -mt-4 bg-paper rounded-t-3xl">
                <h2 className="font-serif text-lg font-bold text-ink text-center tracking-tight leading-snug">
                  הגעת למכסת המשרות החינמיות
                </h2>
                <p className="text-sm text-ink-2 text-center leading-relaxed">
                  בגרסה החינמית ניתן לפרסם עד 2 מודעות.<br />
                  שדרג ל-Hevre+ לפרסום ללא הגבלה.
                </p>
                <div className="flex flex-col gap-2 mt-1">
                  <button
                    onClick={() => { setShowLimitModal(false); router.push("/hevre-plus"); }}
                    className="w-full h-13 bg-terracotta text-cream font-serif font-semibold text-base rounded-2xl flex items-center justify-center py-3.5 active:opacity-90 transition-opacity"
                  >
                    שדרג ל-Hevre+ ✦
                  </button>
                  <button onClick={() => setShowLimitModal(false)} className="w-full h-12 text-ink-3 font-mono text-xs uppercase tracking-wider active:opacity-70">
                    אולי אחר כך
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
