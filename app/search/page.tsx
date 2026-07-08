import { Difficulty, Side, UtilityType } from "@prisma/client";
import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { LineupCard } from "@/components/LineupCard";
import { SearchBar } from "@/components/SearchBar";
import { SearchIntentPreview } from "@/components/SearchIntentPreview";
import { prisma } from "@/lib/prisma";
import { formatDifficultyRu, formatMapNameRu, formatSideRu, formatUtilityTypeRu } from "@/src/lib/i18n/lineupDisplay";
import { searchLineups } from "@/src/lib/search";

export const dynamic = "force-dynamic";

function parseBoolean(value?: string) {
  return value === "true" || value === "on";
}

function uniqueMapsForFilter(maps: Array<{ id: number; name: string; slug: string }>) {
  const bySlug = new Map<string, { id: number; name: string; slug: string }>();

  for (const map of maps) {
    const isDust = map.slug === "dust-2" || map.slug === "dust-ii" || map.slug === "dust2" || map.name === "Dust II";
    const key = isDust ? "dust-2" : map.slug;

    if (!bySlug.has(key)) {
      bySlug.set(key, {
        ...map,
        name: isDust ? "Dust 2" : map.name,
        slug: key
      });
    }
  }

  return Array.from(bySlug.values()).sort((left, right) => left.name.localeCompare(right.name));
}

export default async function SearchPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    mapSlug?: string;
    utilityType?: UtilityType;
    area?: string;
    side?: Side;
    difficulty?: Difficulty;
    verifiedOnly?: string;
  };
}) {
  const [maps, search] = await Promise.all([
    prisma.map.findMany({ orderBy: { name: "asc" } }),
    searchLineups({
      query: searchParams?.q ?? "",
      mapSlug: searchParams?.mapSlug,
      utilityType: searchParams?.utilityType,
      area: searchParams?.area,
      side: searchParams?.side,
      difficulty: searchParams?.difficulty,
      verifiedOnly: parseBoolean(searchParams?.verifiedOnly)
    })
  ]);
  const filterMaps = uniqueMapsForFilter(maps);

  return (
    <div className="space-y-8 pb-16">
      <section className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Поиск</div>
          <h1 className="section-title mt-2">Релевантный поиск по опубликованной базе</h1>
          <p className="section-copy mt-3">Сервис понимает карту, тип гранаты, зону и сторону. Черновики и записи на модерации публично не попадают в выдачу.</p>
        </div>
        <SearchBar initialValue={search.query} actionPath="/search" />
      </section>

      <SearchIntentPreview intent={search.intent} />

      <form className="glass-card grid gap-4 rounded-[2rem] p-5 lg:grid-cols-7" method="get">
        <input type="hidden" name="q" value={search.query} />
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Карта</span>
          <select name="mapSlug" defaultValue={searchParams?.mapSlug ?? ""} className="admin-input">
            <option value="">Все</option>
            {filterMaps.map((map) => (
              <option key={map.id} value={map.slug}>
                {formatMapNameRu(map.name, map.slug)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Тип гранаты</span>
          <select name="utilityType" defaultValue={searchParams?.utilityType ?? ""} className="admin-input">
            <option value="">Все</option>
            <option value="smoke">{formatUtilityTypeRu("smoke")}</option>
            <option value="flash">{formatUtilityTypeRu("flash")}</option>
            <option value="molotov">{formatUtilityTypeRu("molotov")}</option>
            <option value="he">{formatUtilityTypeRu("he")}</option>
            <option value="oneway">{formatUtilityTypeRu("oneway")}</option>
            <option value="unknown">{formatUtilityTypeRu("unknown")}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Зона</span>
          <input name="area" defaultValue={searchParams?.area ?? ""} className="admin-input" placeholder="B, Mid, Connector" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Сторона</span>
          <select name="side" defaultValue={searchParams?.side ?? ""} className="admin-input">
            <option value="">Все</option>
            <option value="t">T</option>
            <option value="ct">CT</option>
            <option value="both">{formatSideRu("both")}</option>
            <option value="unknown">{formatSideRu("unknown")}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Сложность</span>
          <select name="difficulty" defaultValue={searchParams?.difficulty ?? ""} className="admin-input">
            <option value="">Все</option>
            <option value="easy">{formatDifficultyRu("easy")}</option>
            <option value="medium">{formatDifficultyRu("medium")}</option>
            <option value="hard">{formatDifficultyRu("hard")}</option>
            <option value="unknown">{formatDifficultyRu("unknown")}</option>
          </select>
        </label>
        <label className="mt-8 flex items-center gap-3 text-sm text-slate-300">
          <input type="checkbox" name="verifiedOnly" value="true" defaultChecked={parseBoolean(searchParams?.verifiedOnly)} className="h-5 w-5 rounded border-white/20 bg-slate-900" />
          Только проверенные
        </label>
        <div className="mt-6 flex items-end">
          <button type="submit" className="admin-button w-full">
            Применить
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Запрос: <span className="text-white">{search.query || "пустой"}</span>
          {search.normalizedQuery ? <> • нормализовано: <span className="text-cyan-200">{search.normalizedQuery}</span></> : null}
        </div>
        <div className="text-sm text-slate-400">{search.results.length} результатов</div>
      </div>

      {search.results.length ? (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {search.results.map((lineup) => (
            <LineupCard key={lineup.id} lineup={lineup} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="В базе пока нет такого опубликованного раскида"
          description="Попробуйте изменить формулировку запроса, ослабить фильтры или опубликовать нужный импортированный раскид через админку."
        />
      )}

      <div className="text-sm text-slate-500">
        Ищете другой сценарий? <Link href="/assistant" className="text-cyan-200">Откройте ассистента</Link>.
      </div>
    </div>
  );
}
