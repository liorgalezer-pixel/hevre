"use client";

import { Home, Search, PlusCircle, Heart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: Home, label: "דף הבית" },
  { href: "/search", icon: Search, label: "חיפוש" },
  { href: "/post?new=1", icon: PlusCircle, label: "פרסום" },
  { href: "/saved", icon: Heart, label: "אהבתי" },
  { href: "/profile", icon: User, label: "אזור אישי" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 right-0 left-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 min-w-[44px]"
            >
              <Icon
                size={24}
                className={active ? "text-blue-700" : "text-gray-400"}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-medium ${active ? "text-blue-700" : "text-gray-400"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
