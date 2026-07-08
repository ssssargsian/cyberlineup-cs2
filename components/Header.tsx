"use client";

import { Bot, Menu, Search, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/search", label: "Поиск", icon: Search },
  { href: "/assistant", label: "Ассистент", icon: Bot },
  { href: "/admin", label: "Админка", icon: ShieldCheck }
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 mb-6 pt-1 backdrop-blur-xl">
      <div className="rounded-2xl border border-white/10 bg-[#0b0f18]/90 px-3 py-2.5 shadow-[0_10px_34px_rgba(0,0,0,0.28)] sm:px-4">
        <div className="relative flex items-center justify-between gap-3">
          <Logo />
          <nav className="hidden shrink-0 gap-1 rounded-xl border border-white/8 bg-black/20 p-1 md:flex">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm",
                    isActive
                      ? "border-orange-400/35 bg-orange-500/10 text-white"
                      : "border-transparent text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-slate-100 transition hover:border-orange-400/35 hover:bg-orange-500/10 md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {isOpen ? (
            <div className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#0b0f18] p-2 shadow-[0_18px_54px_rgba(0,0,0,0.42)] md:hidden">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition",
                      isActive
                        ? "border-orange-400/45 bg-orange-500/15 text-white"
                        : "border-transparent text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
