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
      className="group relative flex h-full min-h-[15rem] flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(13,18,32,0.86)] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:border-cyan-400/25 hover:shadow-[0_22px_90px_rgba(34,211,238,0.13)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(249,115,22,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:26px_26px] opacity-60" />
      <div>
        <div className="relative mb-3 text-xs uppercase tracking-[0.24em] text-cyan-300">КАРТА</div>
        <h3 className="relative text-2xl font-semibold text-white">{formatMapNameRu(name, slug)}</h3>
        <p className="relative mt-3 text-sm leading-7 text-slate-300">{formatMapDescriptionRu(slug, description)}</p>
      </div>
      <div className="relative inline-flex items-center justify-between text-sm text-slate-200">
        <span>{formatLineupCountRu(count)}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
          <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
