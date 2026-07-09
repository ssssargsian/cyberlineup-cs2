"use client";

import { Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { trackGoal } from "@/src/lib/analytics";

const telegramUrl = "https://t.me/cyberlineup";
const storageKey = "cyberlineup:telegram-cta-hidden-until";
const hiddenForMs = 24 * 60 * 60 * 1000;
const showDelayMs = 10 * 1000;

export function TelegramCta() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setIsVisible(false);
      return;
    }

    const hiddenUntil = Number(window.localStorage.getItem(storageKey) ?? 0);

    if (Number.isFinite(hiddenUntil) && hiddenUntil > Date.now()) {
      return;
    }

    const timeoutId = window.setTimeout(() => setIsVisible(true), showDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  if (!isVisible || pathname.startsWith("/admin")) {
    return null;
  }

  function closeCta() {
    window.localStorage.setItem(storageKey, String(Date.now() + hiddenForMs));
    setIsVisible(false);
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[22rem]">
      <div className="rounded-2xl border border-orange-400/25 bg-[#0b0f18]/95 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
              <Send className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-extrabold text-white">1 смок в день в Telegram</div>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Подписывайся на CyberLineup: новые раскидки, подборки по картам и обновления сервиса.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Закрыть Telegram CTA"
            onClick={closeCta}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-cyan-200">@cyberlineup</span>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackGoal("telegram_click", { source: "cta" })}
            className="inline-flex items-center justify-center rounded-xl border border-orange-400/35 bg-[#ff5500] px-4 py-2.5 text-sm font-extrabold text-white transition hover:border-orange-300/55 hover:bg-[#f97316]"
          >
            Открыть Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
