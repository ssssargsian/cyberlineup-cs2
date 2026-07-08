"use client";

import { Bot, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/search", label: "Поиск", icon: Search },
  { href: "/assistant", label: "Ассистент", icon: Bot },
  { href: "/admin", label: "Админка", icon: ShieldCheck }
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 mb-8 pt-1 backdrop-blur-xl">
      <div className="rounded-2xl border border-white/10 bg-[#0b0f18]/95 px-3 py-3 shadow-[0_18px_70px_rgba(0,0,0,0.42)] ring-1 ring-orange-400/5 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <nav className="flex shrink-0 gap-1 overflow-x-auto rounded-xl border border-white/8 bg-black/25 p-1">
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
                      ? "border-orange-400/45 bg-orange-500/15 text-white shadow-[0_0_24px_rgba(255,85,0,0.16)]"
                      : "border-transparent text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
