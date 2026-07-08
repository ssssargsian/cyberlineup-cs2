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
      className="group relative flex h-full min-h-[12rem] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f18]/90 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.2)] transition duration-200 hover:-translate-y-0.5 hover:border-orange-400/30 hover:bg-[#111827]/90"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#ff5500] via-[#f59e0b] to-cyan-300 opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(34,211,238,0.06),transparent_34%)]" />
      <div>
        <div className="relative mb-3 text-xs font-bold uppercase tracking-[0.14em] text-orange-200">Карта</div>
        <h3 className="relative text-2xl font-extrabold leading-none text-white">{formatMapNameRu(name, slug)}</h3>
        <p className="relative mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{formatMapDescriptionRu(slug, description)}</p>
      </div>
      <div className="relative mt-5 inline-flex items-center justify-between border-t border-white/10 pt-4 text-sm font-semibold text-slate-200">
        <span>{formatLineupCountRu(count)}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-400/25 bg-orange-500/10 text-orange-200 transition group-hover:bg-orange-500/15">
          <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
