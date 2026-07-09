"use client";

import { Flame, Sparkles, Zap, Crosshair } from "lucide-react";
import Link from "next/link";

import { trackGoal } from "@/src/lib/analytics";
import { formatLineupTitleRu, formatSideRu, formatUtilityTypeRu } from "@/src/lib/i18n/lineupDisplay";
import { cn } from "@/lib/utils";

const utilityStyles: Record<string, string> = {
  smoke: "border-cyan-300/40 bg-cyan-400/15 text-cyan-100",
  flash: "border-amber-300/40 bg-amber-400/15 text-amber-100",
  molotov: "border-orange-400/40 bg-orange-500/15 text-orange-100",
  he: "border-emerald-300/40 bg-emerald-400/15 text-emerald-100",
  oneway: "border-violet-300/40 bg-violet-400/15 text-violet-100",
  unknown: "border-slate-300/30 bg-slate-500/15 text-slate-100"
};

const utilityIcons: Record<string, typeof Crosshair> = {
  smoke: Crosshair,
  flash: Zap,
  molotov: Flame,
  he: Sparkles,
  oneway: Crosshair,
  unknown: Crosshair
};

export type MapLineupMarker = {
  slug: string;
  title: string;
  utilityType: string;
  side: string;
  area: string | null;
  fromPosition: string | null;
  targetPosition: string | null;
};

export function LineupMarker({
  lineup,
  mapName,
  compact = false
}: {
  lineup: MapLineupMarker;
  mapName: string;
  compact?: boolean;
}) {
  const Icon = utilityIcons[lineup.utilityType] ?? Crosshair;

  return (
    <Link
      href={`/lineups/${lineup.slug}`}
      onClick={() => trackGoal("map_marker_click", { map: mapName, lineupSlug: lineup.slug, utilityType: lineup.utilityType })}
      className={cn(
        "group inline-flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(34,211,238,0.12)]",
        utilityStyles[lineup.utilityType] ?? utilityStyles.unknown,
        compact ? "w-full" : ""
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-black/25">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-white">{formatLineupTitleRu(lineup.title)}</span>
        <span className="mt-1 block truncate text-xs text-slate-300">
          {formatUtilityTypeRu(lineup.utilityType)} · {formatSideRu(lineup.side)} · {lineup.area ?? "Зона не указана"}
        </span>
      </span>
    </Link>
  );
}
