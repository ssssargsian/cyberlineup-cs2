import { Difficulty, LineupStatus, Side, UtilityType } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { EmptyState } from "@/components/EmptyState";
import { LineupCard } from "@/components/LineupCard";
import { prisma } from "@/lib/prisma";
import { MAP_HERO_ACCENTS } from "@/src/lib/catalog";
import { formatDifficultyRu, formatMapDescriptionRu, formatMapNameRu, formatSideRu, formatUtilityTypeRu } from "@/src/lib/i18n/lineupDisplay";

export const dynamic = "force-dynamic";

function parseBoolean(value?: string) {
  return value === "true" || value === "on";
}

export default async function MapPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: {
    utilityType?: UtilityType;
    side?: Side;
    area?: string;
    difficulty?: Difficulty;
    verifiedOnly?: string;
  };
}) {
  const isDustAlias = params.slug === "dust-2" || params.slug === "dust-ii" || params.slug === "dust2";
  const map = isDustAlias
    ? await prisma.map.findFirst({
        where: {
          OR: [{ slug: "dust-2" }, { slug: "dust-ii" }, { slug: "dust2" }, { name: "Dust II" }, { name: "Dust 2" }]
        },
        orderBy: [{ slug: "asc" }, { id: "asc" }]
      })
    : await prisma.map.findUnique({
        where: { slug: params.slug }
      });

  if (!map) {
    notFound();
  }

  if ((params.slug === "dust-ii" || params.slug === "dust2") && map.slug === "dust-2") {
    redirect("/maps/dust-2");
  }

  const where = {
    mapId: map.id,
    status: LineupStatus.published,
    NOT: {
      OR: [
        { slug: { startsWith: "demo-" } },
        { sourceName: { contains: "Demo", mode: "insensitive" as const } },
        { tags: { has: "demo" } }
      ]
    },
    ...(searchParams?.utilityType ? { utilityType: searchParams.utilityType } : {}),
    ...(searchParams?.difficulty ? { difficulty: searchParams.difficulty } : {}),
    ...(searchParams?.area ? { area: { contains: searchParams.area, mode: "insensitive" as const } } : {}),
    ...(searchParams?.side ? { OR: [{ side: searchParams.side }, { side: Side.both }] } : {}),
    ...(parseBoolean(searchParams?.verifiedOnly) ? { isVerified: true } : {})
  };

  const [lineups, counters] = await Promise.all([
    prisma.lineup.findMany({
      where,
      include: { map: true },
      orderBy: [{ isVerified: "desc" }, { updatedAt: "desc" }]
    }),
    prisma.lineup.groupBy({
      by: ["utilityType"],
      where: {
        mapId: map.id,
        status: LineupStatus.published,
        NOT: {
          OR: [
            { slug: { startsWith: "demo-" } },
            { sourceName: { contains: "Demo", mode: "insensitive" as const } },
            { tags: { has: "demo" } }
          ]
        }
      },
      _count: true
    })
  ]);

  const counterMap = Object.fromEntries(counters.map((entry) => [entry.utilityType, entry._count]));
  const displayMapName = formatMapNameRu(map.name, map.slug);

  return (
    <div className="space-y-8 pb-16">
      <section className={`tactical-panel bg-gradient-to-br ${MAP_HERO_ACCENTS[map.slug] ?? "from-cyan-500/20 to-transparent"} p-6 sm:p-8`}>
        <div className="relative grid gap-6 lg:grid-cols-[1.25fr,0.75fr]">
          <div>
            <div className="tactical-label text-orange-200">Карта</div>
            <h1 className="mt-2 text-5xl font-black leading-none text-white">{displayMapName}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{formatMapDescriptionRu(map.slug, map.description)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["smoke", "flash", "molotov", "he", "oneway"].map((type) => (
              <div key={type} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{formatUtilityTypeRu(type)}</div>
                <div className="mt-2 text-3xl font-black text-white">{counterMap[type] ?? 0}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <form className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)] lg:grid-cols-6" method="get">
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
          <span className="text-slate-400">Зона</span>
          <input name="area" defaultValue={searchParams?.area ?? ""} className="admin-input" placeholder="A, B, MID, SHORT" />
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
        <label className="flex items-end gap-3 pb-1 text-sm font-semibold text-slate-300 lg:pt-8">
          <input type="checkbox" name="verifiedOnly" value="true" defaultChecked={parseBoolean(searchParams?.verifiedOnly)} className="h-5 w-5 rounded border-white/20 bg-[#05070d] accent-orange-500" />
          Только проверенные
        </label>
        <div className="flex items-end lg:pt-6">
          <button type="submit" className="admin-button w-full">
            Применить
          </button>
        </div>
      </form>

      {lineups.length ? (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {lineups.map((lineup) => (
            <LineupCard key={lineup.id} lineup={lineup} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="По этой карте нет опубликованных раскидов под выбранные фильтры"
          description="Попробуйте убрать часть фильтров или сначала провести импорт и модерацию через админку."
        />
      )}
    </div>
  );
}
