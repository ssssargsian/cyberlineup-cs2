import type { Metadata } from "next";

import { AppShell } from "@/components/AppShell";
import { YandexMetrika } from "@/src/components/analytics/YandexMetrika";
import { DEFAULT_SEO_DESCRIPTION, DEFAULT_SEO_TITLE, HOME_SEO_TITLE, OG_IMAGE_URL, SITE_NAME, SITE_URL } from "@/src/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_SEO_TITLE,
    template: `%s | ${SITE_NAME}`
  },
  description: DEFAULT_SEO_DESCRIPTION,
  alternates: {
    canonical: SITE_URL
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    title: HOME_SEO_TITLE,
    description: "Быстрый поиск раскидок CS2 обычным языком.",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "CyberLineup — раскидки CS2 за секунды"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_SEO_TITLE,
    description: "Быстрый поиск раскидок CS2 обычным языком.",
    images: [OG_IMAGE_URL]
  },
  verification: {
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined
  },
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
