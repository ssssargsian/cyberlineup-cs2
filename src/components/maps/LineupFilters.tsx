"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";

import { trackGoal } from "@/src/lib/analytics";
import { formatDifficultyRu, formatSideRu, formatUtilityTypeRu } from "@/src/lib/i18n/lineupDisplay";

export function LineupFilters({
  mapName,
  mapSlug,
  maps,
  areas,
  defaults,
  resultsCount
}: {
  mapName: string;
  mapSlug: string;
  maps: Array<{ name: string; slug: string }>;
  areas: string[];
  defaults: {
    utilityType?: string;
    side?: string;
    area?: string;
    difficulty?: string;
    verifiedOnly?: string;
  };
  resultsCount: number;
}) {
  function trackFilterChange(form: HTMLFormElement) {
    const formData = new FormData(form);
    trackGoal("map_filter_change", {
      map: mapName,
      utilityType: String(formData.get("utilityType") ?? ""),
      side: String(formData.get("side") ?? "")
    });
  }

  return (
    <aside className="rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 p-5 shadow-[0_22px_80px_rgba(0,0,0,0.28)] lg:sticky lg:top-28">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-orange-200">Фильтры</div>
          <h2 className="mt-1 text-2xl font-black text-white">{mapName}</h2>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-sm font-bold text-cyan-100">{resultsCount}</div>
      </div>

      <form
        className="mt-5 grid gap-4"
        method="get"
        onChange={(event) => {
          if (event.currentTarget instanceof HTMLFormElement) {
            trackFilterChange(event.currentTarget);
          }
        }}
      >
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Карта</span>
          <select
            value={mapSlug}
            onChange={(event) => {
              trackGoal("map_filter_change", { map: event.target.value, utilityType: defaults.utilityType ?? "", side: defaults.side ?? "" });
              window.location.href = `/maps/${event.target.value}`;
            }}
            className="admin-input"
          >
            {maps.map((map) => (
              <option key={map.slug} value={map.slug}>
                {map.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Тип гранаты</span>
          <select name="utilityType" defaultValue={defaults.utilityType ?? ""} className="admin-input">
            <option value="">Все</option>
            <option value="smoke">{formatUtilityTypeRu("smoke")}</option>
            <option value="flash">{formatUtilityTypeRu("flash")}</option>
            <option value="molotov">{formatUtilityTypeRu("molotov")}</option>
            <option value="he">{formatUtilityTypeRu("he")}</option>
            <option value="oneway">{formatUtilityTypeRu("oneway")}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Сторона</span>
          <select name="side" defaultValue={defaults.side ?? ""} className="admin-input">
            <option value="">Все</option>
            <option value="t">T</option>
            <option value="ct">CT</option>
            <option value="both">{formatSideRu("both")}</option>
            <option value="unknown">{formatSideRu("unknown")}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Зона</span>
          <select name="area" defaultValue={defaults.area ?? ""} className="admin-input">
            <option value="">Все зоны</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Сложность</span>
          <select name="difficulty" defaultValue={defaults.difficulty ?? ""} className="admin-input">
            <option value="">Все</option>
            <option value="easy">{formatDifficultyRu("easy")}</option>
            <option value="medium">{formatDifficultyRu("medium")}</option>
            <option value="hard">{formatDifficultyRu("hard")}</option>
            <option value="unknown">{formatDifficultyRu("unknown")}</option>
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-300">
          <input type="checkbox" name="verifiedOnly" value="true" defaultChecked={defaults.verifiedOnly === "true" || defaults.verifiedOnly === "on"} className="h-5 w-5 rounded border-white/20 bg-[#05070d] accent-orange-500" />
          Только проверенные
        </label>
        <div className="grid gap-2">
          <button type="submit" className="admin-button w-full">
            Применить
          </button>
          <Link href={`/maps/${mapSlug}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-400/10">
            <RotateCcw className="h-4 w-4" />
            Сбросить
          </Link>
        </div>
      </form>
    </aside>
  );
}
