import { ArrowRight, CheckCheck, Crosshair, DatabaseZap, Flame, MapPinned, Search, Sparkles, Video, Zap } from "lucide-react";
import Link from "next/link";

import { LineupCard } from "@/components/LineupCard";
import { MapCard } from "@/components/MapCard";
import { SearchBar } from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";
import { BENEFITS, POPULAR_QUERIES } from "@/src/lib/catalog";
import { LineupStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const icons = [Search, Sparkles, Video, DatabaseZap, CheckCheck];

function canonicalMapKey(map: { name: string; slug: string }) {
  if (map.slug === "dust-2" || map.slug === "dust-ii" || map.slug === "dust2" || map.name === "Dust II") {
    return "dust-2";
  }

  return map.slug;
}

export default async function HomePage() {
  const publicLineupWhere = {
    status: LineupStatus.published,
    NOT: {
      OR: [{ slug: { startsWith: "demo-" } }, { sourceName: { contains: "Demo", mode: "insensitive" as const } }, { tags: { has: "demo" } }]
    }
  };

  const [maps, featuredLineups, totalLineups, utilityCounters] = await Promise.all([
    prisma.map.findMany({
      include: {
        _count: {
          select: {
            lineups: { where: publicLineupWhere }
          }
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.lineup.findMany({
      where: publicLineupWhere,
      include: { map: true },
      orderBy: [{ isVerified: "desc" }, { updatedAt: "desc" }],
      take: 6
    }),
    prisma.lineup.count({ where: publicLineupWhere }),
    prisma.lineup.groupBy({
      by: ["utilityType"],
      where: publicLineupWhere,
      _count: true
    })
  ]);
  const mapCards = Array.from(
    maps
      .reduce<
        Map<
          string,
          {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            _count: { lineups: number };
          }
        >
      >((accumulator, map) => {
        const key = canonicalMapKey(map);
        const existing = accumulator.get(key);

        if (existing) {
          existing._count.lineups += map._count.lineups;
          return accumulator;
        }

        accumulator.set(key, {
          ...map,
          name: key === "dust-2" ? "Dust 2" : map.name,
          slug: key === "dust-2" ? "dust-2" : map.slug
        });

        return accumulator;
      }, new Map())
      .values()
  );
  const utilityCounterMap = Object.fromEntries(utilityCounters.map((entry) => [entry.utilityType, entry._count]));
  const stats = [
    { label: "Всего раскидок", value: totalLineups, icon: DatabaseZap, accent: "bg-[#ff5500]" },
    { label: "Карт", value: mapCards.length, icon: MapPinned, accent: "bg-cyan-300" },
    { label: "Смоков", value: utilityCounterMap.smoke ?? 0, icon: Crosshair, accent: "bg-cyan-300" },
    { label: "Флешек", value: utilityCounterMap.flash ?? 0, icon: Zap, accent: "bg-amber-300" },
    { label: "Молотовых", value: utilityCounterMap.molotov ?? 0, icon: Flame, accent: "bg-orange-400" },
    { label: "HE", value: utilityCounterMap.he ?? 0, icon: Sparkles, accent: "bg-emerald-300" }
  ];

  return (
    <div className="space-y-10 pb-16 sm:space-y-12">
      <section className="tactical-panel px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-100">
            ИИ-помощник по раскидкам CS2
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.04] text-white sm:text-5xl lg:text-6xl">
            Раскидки CS2 за секунды
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Ищите смоки, флешки, молотовы и HE обычным языком. Открывайте раскидки с фото шагов.
          </p>

          <SearchBar
            actionPath="/search"
            large
            buttonLabel="Найти раскид"
            placeholder="Например: смок B Dust 2, флеш мид Mirage"
            className="mt-7 max-w-3xl text-left"
          />

          <div className="mt-5 flex max-w-3xl flex-wrap justify-center gap-2.5">
            {POPULAR_QUERIES.slice(0, 5).map((query) => (
              <Link
                key={query}
                href={`/search?q=${encodeURIComponent(query)}`}
                className="inline-flex max-w-full items-center rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white"
              >
                <span className="truncate">{query}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-[#0b0f18]/90 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.2)]">
              <div className={`mb-4 h-1 w-10 rounded-full ${stat.accent}`} />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-3xl font-extrabold text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-200">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title">Карты</h2>
          </div>
          <p className="section-copy max-w-2xl">Выберите карту и откройте доступные раскидки.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {mapCards.map((map) => (
            <MapCard
              key={map.id}
              name={map.name}
              slug={map.slug}
              description={map.description}
              count={map._count.lineups}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {BENEFITS.map((benefit, index) => {
          const Icon = icons[index] ?? Sparkles;

          return (
            <div key={benefit} className="rounded-2xl border border-white/10 bg-[#0b0f18]/80 p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-sm leading-7 text-slate-300">{benefit}</div>
            </div>
          );
        })}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="tactical-label text-orange-200">Подборка</div>
            <h2 className="section-title mt-2">Опубликованные раскидки</h2>
          </div>
          <Link href="/search" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
            Перейти к поиску
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {featuredLineups.map((lineup) => (
            <LineupCard key={lineup.id} lineup={lineup} />
          ))}
        </div>
      </section>
    </div>
  );
}
