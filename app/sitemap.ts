import type { MetadataRoute } from "next";
import { LineupStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/src/lib/seo";

export const dynamic = "force-dynamic";

function canonicalMapSlug(map: { name: string; slug: string }) {
  if (map.slug === "dust-2" || map.slug === "dust-ii" || map.slug === "dust2" || map.name === "Dust II") {
    return "dust-2";
  }

  return map.slug;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [maps, lineups] = await Promise.all([
    prisma.map.findMany({
      select: {
        name: true,
        slug: true,
        updatedAt: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.lineup.findMany({
      where: {
        status: LineupStatus.published,
        NOT: {
          OR: [
            { slug: { startsWith: "demo-" } },
            { sourceName: { contains: "Demo", mode: "insensitive" } },
            { tags: { has: "demo" } }
          ]
        }
      },
      select: {
        slug: true,
        updatedAt: true
      },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  const mapEntries = Array.from(
    maps
      .reduce<Map<string, Date>>((accumulator, map) => {
        const slug = canonicalMapSlug(map);
        const existing = accumulator.get(slug);

        if (!existing || map.updatedAt > existing) {
          accumulator.set(slug, map.updatedAt);
        }

        return accumulator;
      }, new Map())
      .entries()
  ).map(([slug, updatedAt]) => ({
    url: absoluteUrl(`/maps/${slug}`),
    lastModified: updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  const lineupEntries = lineups.map((lineup) => ({
    url: absoluteUrl(`/lineups/${lineup.slug}`),
    lastModified: lineup.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7
  }));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: absoluteUrl("/search"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6
    },
    {
      url: absoluteUrl("/assistant"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6
    },
    ...mapEntries,
    ...lineupEntries
  ];
}
