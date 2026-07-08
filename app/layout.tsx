import type { Metadata } from "next";

import { AppShell } from "@/components/AppShell";
import { APP_NAME, APP_SUBTITLE } from "@/src/lib/catalog";

import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_SUBTITLE
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
