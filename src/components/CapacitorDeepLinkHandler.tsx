"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CapacitorDeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof (window as any).Capacitor === "undefined") return;

    import("@capacitor/app").then(({ App }) => {
      App.addListener("appUrlOpen", (event: { url: string }) => {
        const url = event.url;
        if (url.startsWith("hevre://auth/callback")) {
          import("@capacitor/browser").then(({ Browser }) => Browser.close()).catch(() => {});
          router.replace("/auth/callback");
        }
      });
    }).catch(() => {});
  }, [router]);

  return null;
}
