import { ArrowRight, CheckCheck, Crosshair, DatabaseZap, Flame, MapPinned, Search, Sparkles, Video, Zap } from "lucide-react";
import Link from "next/link";

import { LineupCard } from "@/components/LineupCard";
import { Logo } from "@/components/Logo";
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
    { label: "Всего раскидов", value: totalLineups, icon: DatabaseZap, accent: "from-[#ff5500] to-[#f59e0b]" },
    { label: "Карт", value: mapCards.length, icon: MapPinned, accent: "from-cyan-300 to-blue-500" },
    { label: "Смоков", value: utilityCounterMap.smoke ?? 0, icon: Crosshair, accent: "from-cyan-300 to-blue-500" },
    { label: "Флешек", value: utilityCounterMap.flash ?? 0, icon: Zap, accent: "from-yellow-300 to-amber-500" },
    { label: "Молотовых", value: utilityCounterMap.molotov ?? 0, icon: Flame, accent: "from-orange-400 to-red-500" }
  ];

  return (
    <div className="space-y-12 pb-16">
      <section className="tactical-panel px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="relative space-y-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:px-5">
              <Logo />
            </div>
            <SearchBar
              actionPath="/search"
              buttonLabel="Найти раскид"
              placeholder="Например: смок B Dust 2, флеш мид Mirage"
              className="lg:max-w-3xl"
            />
          </div>

          <div className="grid gap-7 lg:grid-cols-[1.08fr,0.92fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-200">
                ИИ-помощник по раскидам CS2
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                Раскиды CS2 за секунды
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Смоки, флешки, молотовы и HE по картам. Ищите обычным языком и открывайте раскиды с фото шагов.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {POPULAR_QUERIES.slice(0, 4).map((query, index) => (
                <Link
                  key={query}
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="group flex min-h-[5.5rem] flex-col justify-between rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-cyan-400/10"
                >
                  <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-500">Запрос {String(index + 1).padStart(2, "0")}</div>
                  <div className="text-base font-black text-white">{query}</div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-200">
                    Открыть поиск
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.26)]">
              <div className={`mb-5 h-1 w-16 rounded-full bg-gradient-to-r ${stat.accent}`} />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-4xl font-black text-white">{stat.value}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-400">{stat.label}</div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-orange-200">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-5">
        {BENEFITS.map((benefit, index) => {
          const Icon = icons[index] ?? Sparkles;

          return (
            <div key={benefit} className="rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/85 p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
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
            <div className="tactical-label text-orange-200">Карты</div>
            <h2 className="section-title mt-2">Карты и быстрые входы в базу</h2>
          </div>
          <p className="section-copy max-w-2xl">Открывайте карту целиком, фильтруйте по типам гранат и работайте только с опубликованными записями.</p>
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

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="tactical-label text-orange-200">Подборка</div>
            <h2 className="section-title mt-2">Опубликованные раскиды</h2>
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
