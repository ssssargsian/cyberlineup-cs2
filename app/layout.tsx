import type { Metadata } from "next";

import { AppShell } from "@/components/AppShell";
import { YandexMetrika } from "@/src/components/analytics/YandexMetrika";
import { APP_NAME } from "@/src/lib/catalog";

import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Раскидки CS2 за секунды",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/logo.png",
    apple: "/logo.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AppShell>{children}</AppShell>
        <YandexMetrika />
      </body>
    </html>
  );
}
