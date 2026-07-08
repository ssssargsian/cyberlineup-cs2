import Link from "next/link";

import { APP_NAME } from "@/src/lib/catalog";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link href={href} className="group inline-flex min-w-0 items-center gap-2.5 sm:gap-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-400/35 bg-[#05070d] shadow-[0_0_28px_rgba(255,85,0,0.2)] sm:h-11 sm:w-11">
        <img src="/logo.svg" alt="CyberLineup" className="h-full w-full object-cover" />
      </div>
      <div className={cn("min-w-0", compact && "hidden sm:block")}>
        <div className="truncate text-sm font-black uppercase tracking-[0.14em] text-slate-100 sm:tracking-[0.22em]">{APP_NAME}</div>
      </div>
    </Link>
  );
}
