import { Difficulty, LineupStatus, Side, UtilityType } from "@prisma/client";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { EmptyState } from "@/components/EmptyState";
import { LineupCard } from "@/components/LineupCard";
import { prisma } from "@/lib/prisma";
import { TrackedExternalLink } from "@/src/components/TrackedExternalLink";
import { LineupFilters } from "@/src/components/maps/LineupFilters";
import { LineupMap } from "@/src/components/maps/LineupMap";
import { MAP_HERO_ACCENTS } from "@/src/lib/catalog";
import { formatMapDescriptionRu, formatMapNameRu, formatUtilityTypeRu } from "@/src/lib/i18n/lineupDisplay";
import { absoluteUrl } from "@/src/lib/seo";

export const dynamic = "force-dynamic";

const mapTitleFragments: Record<string, string> = {
  inferno: "смоки и молотовы",
  ancient: "флешки и HE",
  mirage: "смоки и флешки"
};

function parseBoolean(value?: string) {
  return value === "true" || value === "on";
}

function canonicalMapKey(map: { name: string; slug: string }) {
  if (map.slug === "dust-2" || map.slug === "dust-ii" || map.slug === "dust2" || map.name === "Dust II") {
    return "dust-2";
  }

  return map.slug;
}

async function findMapBySlug(slug: string) {
  const isDustAlias = slug === "dust-2" || slug === "dust-ii" || slug === "dust2";

  if (isDustAlias) {
    return prisma.map.findFirst({
      where: {
        OR: [{ slug: "dust-2" }, { slug: "dust-ii" }, { slug: "dust2" }, { name: "Dust II" }, { name: "Dust 2" }]
      },
      orderBy: [{ slug: "asc" }, { id: "asc" }]
    });
  }

  return prisma.map.findUnique({
    where: { slug }
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const map = await findMapBySlug(params.slug);

  if (!map) {
    return {
      title: "Карта не найдена",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const displayMapName = formatMapNameRu(map.name, map.slug);
  const utilityFragment = mapTitleFragments[map.slug] ?? "смоки и флешки";
  const title = `${displayMapName} — раскидки CS2, ${utilityFragment}`;
  const description = `Раскидки CS2 на карте ${displayMapName}: смоки, флешки, молотовы и HE с фото шагов. Быстрый поиск по карте на CyberLineup.`;
  const canonicalPath = `/maps/${map.slug === "dust-ii" || map.slug === "dust2" ? "dust-2" : map.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(canonicalPath)
    },
    openGraph: {
      title: `${title} | CyberLineup`,
      description,
      url: absoluteUrl(canonicalPath)
    },
    twitter: {
      title: `${title} | CyberLineup`,
      description
    }
  };
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
  const map = await findMapBySlug(params.slug);

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

  const [lineups, counters, areas, allMaps] = await Promise.all([
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
    }),
    prisma.lineup.findMany({
      where: {
        mapId: map.id,
        status: LineupStatus.published,
        area: { not: null },
        NOT: {
          OR: [
            { slug: { startsWith: "demo-" } },
            { sourceName: { contains: "Demo", mode: "insensitive" as const } },
            { tags: { has: "demo" } }
          ]
        }
      },
      select: { area: true },
      distinct: ["area"],
      orderBy: { area: "asc" }
    }),
    prisma.map.findMany({
      select: { name: true, slug: true },
      orderBy: { name: "asc" }
    })
  ]);

  const counterMap = Object.fromEntries(counters.map((entry) => [entry.utilityType, entry._count]));
  const displayMapName = formatMapNameRu(map.name, map.slug);
  const totalMapLineups = counters.reduce((sum, entry) => sum + entry._count, 0);
  const filterAreas = areas.map((entry) => entry.area).filter((area): area is string => Boolean(area));
  const mapOptions = Array.from(
    allMaps
      .reduce<Map<string, { name: string; slug: string }>>((accumulator, option) => {
        const key = canonicalMapKey(option);
        if (!accumulator.has(key)) {
          accumulator.set(key, { name: key === "dust-2" ? "Dust 2" : option.name, slug: key });
        }
        return accumulator;
      }, new Map())
      .values()
  ).sort((left, right) => left.name.localeCompare(right.name));
  const markerLineups = lineups.map((lineup) => ({
    slug: lineup.slug,
    title: lineup.title,
    utilityType: lineup.utilityType,
    side: lineup.side,
    area: lineup.area,
    fromPosition: lineup.fromPosition,
    targetPosition: lineup.targetPosition
  }));

  return (
    <div className="space-y-8 pb-16">
      <section className={`tactical-panel bg-gradient-to-br ${MAP_HERO_ACCENTS[map.slug] ?? "from-cyan-500/20 to-transparent"} p-6 sm:p-8`}>
        <div className="relative grid gap-6 lg:grid-cols-[1.25fr,0.75fr]">
          <div>
            <div className="tactical-label text-orange-200">Карта</div>
            <h1 className="mt-2 text-4xl font-black leading-tight text-white sm:text-5xl">Раскидки CS2 на {displayMapName}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{formatMapDescriptionRu(map.slug, map.description)}</p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              На этой странице собраны раскидки CS2 для карты {displayMapName}: смоки, флешки, молотовы и HE. Используйте поиск
              CyberLineup, чтобы быстро найти нужную гранату.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-orange-100">Всего</div>
              <div className="mt-2 text-3xl font-black text-white">{totalMapLineups}</div>
            </div>
            {["smoke", "flash", "molotov", "he", "oneway"].map((type) => (
              <div key={type} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{formatUtilityTypeRu(type)}</div>
                <div className="mt-2 text-3xl font-black text-white">{counterMap[type] ?? 0}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr),22rem]">
        <div className="space-y-6">
          <LineupMap mapName={displayMapName} mapImageUrl={map.imageUrl} lineups={markerLineups} />

          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-orange-200">Список</div>
                <h2 className="mt-1 text-3xl font-black text-white">Найденные раскидки</h2>
              </div>
              <p className="text-sm text-slate-400">{lineups.length} по текущим фильтрам</p>
            </div>
            {lineups.length ? (
              <div className="grid gap-5 xl:grid-cols-2">
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
        </div>
        <div className="space-y-5">
          <LineupFilters
            mapName={displayMapName}
            mapSlug={map.slug}
            maps={mapOptions}
            areas={filterAreas}
            defaults={{
              utilityType: searchParams?.utilityType,
              side: searchParams?.side,
              area: searchParams?.area,
              difficulty: searchParams?.difficulty,
              verifiedOnly: searchParams?.verifiedOnly
            }}
            resultsCount={lineups.length}
          />
          <div className="rounded-[1.5rem] border border-cyan-300/15 bg-cyan-400/[0.045] p-5">
            <h2 className="text-lg font-black text-white">Больше раскидок в Telegram</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Подписывайся на @cyberlineup — новые смоки, флешки и подборки по картам.</p>
            <TrackedExternalLink
              href="https://t.me/cyberlineup"
              target="_blank"
              rel="noreferrer"
              goal="telegram_click"
              params={{ source: "map_sidebar", map: displayMapName }}
              className="mt-4 inline-flex rounded-xl border border-orange-400/35 bg-[#ff5500] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#f97316]"
            >
              Открыть Telegram
            </TrackedExternalLink>
          </div>
        </div>
      </section>
    </div>
  );
}
