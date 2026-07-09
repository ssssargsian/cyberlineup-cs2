"use client";

import { MapPinned, Minus, MousePointer2, Plus, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LineupMarker, type MapLineupMarker } from "@/src/components/maps/LineupMarker";
import { formatUtilityTypeRu } from "@/src/lib/i18n/lineupDisplay";

export function LineupMap({
  mapName,
  mapImageUrl,
  lineups
}: {
  mapName: string;
  mapImageUrl?: string | null;
  lineups: MapLineupMarker[];
}) {
  const [learnedCount, setLearnedCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const groupedByUtility = useMemo(() => {
    return lineups.reduce<Record<string, number>>((accumulator, lineup) => {
      accumulator[lineup.utilityType] = (accumulator[lineup.utilityType] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [lineups]);

  useEffect(() => {
    const learned = lineups.filter((lineup) => window.localStorage.getItem(`cyberlineup:learned:${lineup.slug}`) === "true").length;
    setLearnedCount(learned);
  }, [lineups]);

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0f18]/95 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-orange-200">Рабочая карта</div>
          <h2 className="mt-1 text-2xl font-black text-white">{mapName}</h2>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-sm font-bold text-cyan-100">
          Изучено {learnedCount} из {lineups.length} раскидок
        </div>
      </div>

      <div className="relative aspect-[4/3] min-h-[20rem] overflow-hidden bg-[#05070d] sm:aspect-[16/10]">
        <div className="absolute inset-0 transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
          {mapImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mapImageUrl} alt={`Карта ${mapName}`} className="h-full w-full object-cover opacity-75" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_28%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_72%_35%,rgba(255,85,0,0.14),transparent_28%),linear-gradient(135deg,#0b1020,#111827_48%,#0f172a)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
        </div>
        <div className="absolute inset-x-4 top-4 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <MapPinned className="mt-0.5 h-5 w-5 shrink-0 text-orange-200" />
            <div>
              <div className="text-sm font-black text-white">Координаты маркеров пока не заданы</div>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Точные точки на карте не выдумываем. Ниже показаны кликабельные маркеры-список по опубликованным раскидкам.
              </p>
            </div>
          </div>
          {/* TODO: подключить реальные координаты маркеров, когда они появятся в базе/moderation UI. */}
        </div>
        <div className="absolute right-4 top-32 z-10 flex flex-col gap-2 sm:top-24">
          <button
            type="button"
            aria-label="Приблизить карту"
            onClick={() => setZoom((value) => Math.min(1.8, Number((value + 0.15).toFixed(2))))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/55 text-white backdrop-blur transition hover:border-cyan-300/35"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Отдалить карту"
            onClick={() => setZoom((value) => Math.max(1, Number((value - 0.15).toFixed(2))))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/55 text-white backdrop-blur transition hover:border-cyan-300/35"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Сбросить масштаб карты"
            onClick={() => setZoom(1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/55 text-white backdrop-blur transition hover:border-orange-300/35"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          {Object.entries(groupedByUtility).map(([type, count]) => (
            <span key={type} className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-bold text-slate-100 backdrop-blur">
              {formatUtilityTypeRu(type)}: {count}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
        {lineups.slice(0, 12).map((lineup) => (
          <LineupMarker key={lineup.slug} lineup={lineup} mapName={mapName} compact />
        ))}
      </div>

      {lineups.length > 12 ? (
        <div className="flex items-center gap-2 border-t border-white/10 px-5 py-4 text-sm text-slate-400">
          <MousePointer2 className="h-4 w-4 text-cyan-200" />
          Ещё {lineups.length - 12} раскидок доступны в списке ниже.
        </div>
      ) : null}
    </section>
  );
}
