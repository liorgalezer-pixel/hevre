"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function usePostLimit() {
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

  return { showLimitModal, setShowLimitModal, handlePostClick };
}
