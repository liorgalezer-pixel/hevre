"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      // Check if user has completed profile setup
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", session.user.id)
        .single();

      if (!profile?.first_name) {
        // New user — send to registration flow
        router.replace("/register/details");
      } else {
        router.replace("/");
      }
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white" dir="rtl">
      <p className="text-gray-500 text-sm">מתחבר...</p>
    </div>
  );
}
