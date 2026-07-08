import { ArrowRight, Bot, CheckCheck, DatabaseZap, Search, Sparkles, Video } from "lucide-react";
import Link from "next/link";

import { LineupCard } from "@/components/LineupCard";
import { MapCard } from "@/components/MapCard";
import { SearchBar } from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";
import { BENEFITS, POPULAR_QUERIES, APP_SUBTITLE, APP_TAGLINE, MAPS } from "@/src/lib/catalog";
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
  const [maps, featuredLineups] = await Promise.all([
    prisma.map.findMany({
      include: {
        _count: {
          select: {
            lineups: {
              where: {
                status: LineupStatus.published,
                NOT: {
                  OR: [{ slug: { startsWith: "demo-" } }, { sourceName: { contains: "Demo", mode: "insensitive" } }, { tags: { has: "demo" } }]
                }
              }
            }
          }
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.lineup.findMany({
      where: {
        status: LineupStatus.published,
        NOT: {
          OR: [{ slug: { startsWith: "demo-" } }, { sourceName: { contains: "Demo", mode: "insensitive" } }, { tags: { has: "demo" } }]
        }
      },
      include: { map: true },
      orderBy: [{ isVerified: "desc" }, { updatedAt: "desc" }],
      take: 6
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

  return (
    <div className="space-y-14 pb-16">
      <section className="glass-card overflow-hidden rounded-[2.5rem] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200">
              <Bot className="h-3.5 w-3.5" />
              {APP_TAGLINE}
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              Находите раскиды в CS2 человеческим языком.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{APP_SUBTITLE}</p>

            <div className="mt-8">
              <SearchBar actionPath="/search" large />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {MAPS.map((map) => (
                <Link
                  key={map.slug}
                  href={`/maps/${map.slug}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/25 hover:bg-cyan-400/10 hover:text-white"
                >
                  {map.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {POPULAR_QUERIES.map((query, index) => (
              <Link
                key={query}
                href={`/search?q=${encodeURIComponent(query)}`}
                className="glass-card flex min-h-[8rem] flex-col justify-between rounded-[1.75rem] p-4 transition hover:border-cyan-400/20 hover:bg-white/10"
              >
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Популярный запрос {String(index + 1).padStart(2, "0")}</div>
                <div className="text-lg font-medium text-white">{query}</div>
                <div className="inline-flex items-center gap-2 text-sm text-cyan-200">
                  Открыть поиск
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-5">
        {BENEFITS.map((benefit, index) => {
          const Icon = icons[index] ?? Sparkles;

          return (
            <div key={benefit} className="glass-card rounded-[2rem] p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200">
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
            <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Карты</div>
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
            <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Подборка</div>
            <h2 className="section-title mt-2">Опубликованные раскиды</h2>
          </div>
          <Link href="/search" className="inline-flex items-center gap-2 text-sm text-cyan-200">
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
