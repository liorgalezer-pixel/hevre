import type { Metadata, Viewport } from "next";
import { Heebo, Frank_Ruhl_Libre, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PostHogProvider from "@/components/PostHogProvider";
import PostHogPageView from "@/components/PostHogPageView";
import CapacitorDeepLinkHandler from "@/components/CapacitorDeepLinkHandler";
import OfflineScreen from "@/components/OfflineScreen";
import { Suspense } from "react";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-heebo",
  display: "swap",
});

const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-frank",
  display: "swap",
});

const jetMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono-jet",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hevre | משרות לישראלים בארה״ב",
  description: "פלטפורמת חיפוש עבודה לישראלים בארה״ב",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#D97757", // terracotta — was #1d4ed8
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${frankRuhl.variable} ${jetMono.variable}`}>
      <body className="bg-cream min-h-screen font-sans text-ink">
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <CapacitorDeepLinkHandler />
          <OfflineScreen />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
