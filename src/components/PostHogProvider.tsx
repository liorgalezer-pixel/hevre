"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "phc_CWSymg8RLvzM6gvpsdaP2NmYFzH2ByQH3rvN5eoLckh7";
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
