import Link from "next/link";

import { APP_NAME } from "@/src/lib/catalog";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link href={href} className="group inline-flex min-w-0 items-center gap-2.5 sm:gap-3">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-400/25 bg-[#05070d] shadow-[0_0_18px_rgba(255,85,0,0.12)] sm:h-10 sm:w-10">
        <img src="/logo.png" alt="CyberLineup" className="h-full w-full object-cover" />
      </div>
      <div className={cn("min-w-0", compact && "hidden sm:block")}>
        <div className="truncate text-sm font-extrabold tracking-[0.05em] text-slate-100 sm:text-base sm:tracking-[0.08em]">{APP_NAME}</div>
      </div>
    </Link>
  );
}
