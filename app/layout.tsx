import type { Metadata } from "next";

import { AppShell } from "@/components/AppShell";
import { APP_NAME } from "@/src/lib/catalog";

import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Раскидки CS2 за секунды",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
