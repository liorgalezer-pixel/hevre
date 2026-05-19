import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hevre | משרות לישראלים בניו יורק",
  description: "פלטפורמת חיפוש עבודה לישראלים בניו יורק",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1d4ed8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
