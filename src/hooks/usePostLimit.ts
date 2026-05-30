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

    // Check active subscription — subscribers have no post limit
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .in("status", ["active", "canceling"])
      .maybeSingle();

    const limit = sub?.plan === "plus" ? Infinity : sub?.plan === "pro" ? 5 : 2;

    const { count } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("created_by", user.id);

    if ((count ?? 0) >= limit) {
      setShowLimitModal(true);
    } else {
      router.push("/post?new=1");
    }
  };

  return { showLimitModal, setShowLimitModal, handlePostClick };
}
