"use client";

import { Send } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/Logo";
import { trackGoal } from "@/src/lib/analytics";

const footerLinks = [
  { href: "/search", label: "Поиск" },
  { href: "/#maps", label: "Карты" },
  { href: "/assistant", label: "Ассистент" }
];

const telegramUrl = "https://t.me/cyberlineup";

export function Footer() {
  return (
    <footer className="mt-14 border-t border-white/10 pt-8 pb-6">
      <div className="grid gap-8 rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/76 p-5 sm:p-6 lg:grid-cols-[1.25fr_0.8fr_1fr] lg:p-7">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm leading-7 text-slate-300">
            CyberLineup — быстрый поиск раскидок CS2: смоки, флешки, молотовы и HE.
          </p>
        </div>

        <nav className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Навигация</div>
          <div className="grid gap-2">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-semibold text-slate-300 transition hover:text-orange-200">
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("cyberlineup:open-feedback"))}
              className="text-left text-sm font-semibold text-slate-300 transition hover:text-orange-200"
            >
              Предложить улучшение
            </button>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackGoal("telegram_click", { source: "footer" })}
              className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
            >
              Telegram
            </a>
          </div>
        </nav>

        <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.045] p-4">
          <div className="text-base font-extrabold text-white">Сообщество в Telegram</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">Новые раскидки, подборки и обновления сервиса.</p>
          <div className="mt-3 text-sm font-semibold text-cyan-200">@cyberlineup · 1 смок в день</div>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackGoal("telegram_click", { source: "footer" })}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-orange-400/35 bg-[#ff5500] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(255,85,0,0.16)] transition hover:border-orange-300/55 hover:bg-[#f97316]"
          >
            <Send className="h-4 w-4" />
            Подписаться
          </a>
        </div>
      </div>
    </footer>
  );
}
