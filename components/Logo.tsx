import { Shield } from "lucide-react";
import Link from "next/link";

import { APP_NAME } from "@/src/lib/catalog";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-orange-400/40 bg-orange-500/10 text-orange-200 shadow-[0_0_28px_rgba(255,85,0,0.2)]">
        <Shield className="h-5 w-5" />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400/18 via-transparent to-cyan-400/16 opacity-50 transition group-hover:opacity-90" />
      </div>
      <div className={cn("min-w-0", compact && "hidden sm:block")}>
        <div className="truncate text-sm font-black uppercase tracking-[0.32em] text-slate-100">{APP_NAME}</div>
        <div className="hidden truncate text-xs text-slate-400 sm:block">Sargsian Rafik</div>
      </div>
    </Link>
  );
}
