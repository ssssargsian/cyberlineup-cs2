import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { formatLineupCountRu, formatMapDescriptionRu, formatMapNameRu } from "@/src/lib/i18n/lineupDisplay";

export function MapCard({
  name,
  slug,
  description,
  count
}: {
  name: string;
  slug: string;
  description?: string | null;
  count?: number;
}) {
  return (
    <Link
      href={`/maps/${slug}`}
      className="group relative flex h-full min-h-[14.5rem] flex-col justify-between overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-1 hover:border-orange-400/35 hover:shadow-[0_22px_90px_rgba(255,85,0,0.13)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff5500] via-[#f59e0b] to-cyan-300" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,85,0,0.12),transparent_36%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.1),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
      <div>
        <div className="relative mb-3 text-xs font-black uppercase tracking-[0.22em] text-orange-200">КАРТА</div>
        <h3 className="relative text-3xl font-black leading-none text-white">{formatMapNameRu(name, slug)}</h3>
        <p className="relative mt-3 text-sm leading-7 text-slate-300">{formatMapDescriptionRu(slug, description)}</p>
      </div>
      <div className="relative mt-5 inline-flex items-center justify-between border-t border-white/10 pt-4 text-sm font-semibold text-slate-200">
        <span>{formatLineupCountRu(count)}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/[0.12] text-orange-200 transition group-hover:bg-orange-500/20">
          <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
