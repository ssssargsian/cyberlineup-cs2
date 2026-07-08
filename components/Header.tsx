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
    <header className="sticky top-0 z-40 mb-8 backdrop-blur-xl">
      <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(7,10,18,0.82)] px-4 py-3 shadow-[0_20px_80px_rgba(4,8,20,0.42)] ring-1 ring-cyan-400/5 sm:px-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Logo />
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                    isActive
                      ? "border-cyan-400/35 bg-cyan-400/12 text-white shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                      : "border-white/10 bg-slate-950/35 text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
