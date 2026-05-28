"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CapacitorDeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof (window as any).Capacitor === "undefined") return;

    import("@codetrix-studio/capacitor-google-auth").then(({ GoogleAuth }) => {
      GoogleAuth.initialize({
        clientId: "360691641891-ctl91prtra4mer72d4kl4sqdq4lqt7dh.apps.googleusercontent.com",
        scopes: ["profile", "email"],
        grantOfflineAccess: true,
      });
    }).catch(() => {});

    import("@capacitor/app").then(({ App }) => {
      App.addListener("appUrlOpen", (event: { url: string }) => {
        const url = event.url;
        if (url.startsWith("hevre://auth/callback")) {
          import("@capacitor/browser").then(({ Browser }) => Browser.close()).catch(() => {});
          router.replace("/auth/callback");
        }
      });
    }).catch(() => {});

    setupPushNotifications();
  }, [router]);

  return null;
}

async function setupPushNotifications() {
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt") {
      const result = await PushNotifications.requestPermissions();
      if (result.receive !== "granted") return;
    } else if (permStatus.receive !== "granted") {
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener("registration", async (token) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({ fcm_token: token.value })
        .eq("id", user.id);
    });

    PushNotifications.addListener("registrationError", (err) => {
      console.error("Push registration error:", err);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("Push received foreground:", notification);
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      const jobId = action.notification.data?.job_id;
      if (jobId) {
        window.location.href = `/jobs/${jobId}`;
      }
    });
  } catch (err) {
    console.error("Push setup error:", err);
  }
}
