import { Shield } from "lucide-react";
import Link from "next/link";

import { APP_NAME } from "@/src/lib/catalog";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/35 bg-cyan-400/10 text-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.22)]">
        <Shield className="h-5 w-5" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/12 via-transparent to-violet-500/20 opacity-40 transition group-hover:opacity-90" />
      </div>
      <div className={cn("min-w-0", compact && "hidden sm:block")}>
        <div className="truncate text-sm font-semibold uppercase tracking-[0.45em] text-slate-100">{APP_NAME}</div>
        <div className="truncate text-xs text-slate-400">Sargsian Rafik</div>
      </div>
    </Link>
  );
}
