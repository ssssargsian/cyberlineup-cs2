import { Difficulty, LineupStatus, Prisma, Side, UtilityType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { normalizeSearchQueryWithAI } from "@/src/lib/openai";

export type SearchIntent = {
  map?: string;
  mapSlug?: string;
  mapName?: string;
  utilityType?: UtilityType;
  area?: string;
  side?: Side;
  difficulty?: Difficulty;
  verifiedOnly?: boolean;
};

export type SearchFilters = SearchIntent & {
  query?: string;
  status?: LineupStatus;
};

const phraseSynonyms: Array<{ variants: string[]; canonical: string }> = [
  { variants: ["one way"], canonical: "oneway" },
  { variants: ["b site", "б плент", "база б"], canonical: "b" },
  { variants: ["a site", "а плент", "база а"], canonical: "a" },
  { variants: ["ct spawn", "ct-spawn", "респ кт"], canonical: "ct-spawn" },
  { variants: ["t spawn", "t-spawn", "респ т"], canonical: "t-spawn" }
];

const tokenSynonyms: Array<{ variants: string[]; canonical: string }> = [
  { variants: ["даст", "даст2", "dust", "dust2", "d2"], canonical: "dust 2" },
  { variants: ["мираж", "мир", "mirage"], canonical: "mirage" },
  { variants: ["инферно", "inferno"], canonical: "inferno" },
  { variants: ["нюк", "nuke"], canonical: "nuke" },
  { variants: ["эншент", "ancient"], canonical: "ancient" },
  { variants: ["анубис", "anubis"], canonical: "anubis" },
  { variants: ["вертиго", "vertigo"], canonical: "vertigo" },
  { variants: ["овер", "overpass"], canonical: "overpass" },
  { variants: ["офис", "office"], canonical: "office" },
  { variants: ["трейн", "train"], canonical: "train" },
  { variants: ["смок", "дым", "smoke"], canonical: "smoke" },
  { variants: ["флеш", "флешка", "flash"], canonical: "flash" },
  { variants: ["молик", "молотов", "molotov"], canonical: "molotov" },
  { variants: ["хе", "хаешка", "he", "hegrenade"], canonical: "he" },
  { variants: ["ванвей", "oneway"], canonical: "oneway" },
  { variants: ["б", "b"], canonical: "b" },
  { variants: ["а", "a"], canonical: "a" },
  { variants: ["мид", "mid", "middle"], canonical: "mid" },
  { variants: ["банан", "banana"], canonical: "banan" },
  { variants: ["кар", "car"], canonical: "car" },
  { variants: ["кт", "сити", "ct"], canonical: "ct" },
  { variants: ["терры"], canonical: "t-spawn" },
  { variants: ["коннектор", "connector"], canonical: "connector" },
  { variants: ["шорт", "short"], canonical: "short" },
  { variants: ["лонг", "long"], canonical: "long" },
  { variants: ["окно", "window"], canonical: "window" },
  { variants: ["джангл", "jungle"], canonical: "jungle" },
  { variants: ["рампа", "ramp"], canonical: "ramp" }
];

const mapMetaByCanonical = {
  "dust 2": { slug: "dust-2", name: "Dust 2" },
  mirage: { slug: "mirage", name: "Mirage" },
  inferno: { slug: "inferno", name: "Inferno" },
  nuke: { slug: "nuke", name: "Nuke" },
  ancient: { slug: "ancient", name: "Ancient" },
  anubis: { slug: "anubis", name: "Anubis" },
  vertigo: { slug: "vertigo", name: "Vertigo" },
  overpass: { slug: "overpass", name: "Overpass" },
  office: { slug: "office", name: "Office" },
  train: { slug: "train", name: "Train" }
} as const;

const utilityByCanonical: Record<string, UtilityType> = {
  smoke: UtilityType.smoke,
  flash: UtilityType.flash,
  molotov: UtilityType.molotov,
  he: UtilityType.he,
  oneway: UtilityType.oneway
};

const sideByCanonical: Record<string, Side> = {
  "t-spawn": Side.t,
  "ct-spawn": Side.ct,
  t: Side.t,
  ct: Side.ct
};

const difficultyByCanonical: Record<string, Difficulty> = {
  easy: Difficulty.easy,
  medium: Difficulty.medium,
  hard: Difficulty.hard
};

const areaCanonicals = ["a", "b", "mid", "banan", "car", "ct", "t-spawn", "ct-spawn", "connector", "short", "long", "window", "jungle", "ramp"];

const genericTokens = new Set([
  "раскид",
  "раскиды",
  "гранат",
  "граната",
  "cs2",
  "lineup",
  "guide",
  "что",
  "кинуть",
  "какой",
  "какие",
  "как",
  "куда",
  "где",
  "на",
  "в",
  "во",
  "к",
  "ко",
  "из",
  "с",
  "со",
  "для",
  "по",
  "под",
  "от",
  "до",
  "через",
  "если",
  "нужен",
  "нужна",
  "нужно",
  "throw",
  "throws",
  "grenade",
  "grenades",
  "utility",
  "util",
  "the",
  "a",
  "an",
  "to",
  "from",
  "on",
  "at",
  "for",
  "with",
  "please",
  "show",
  "find",
  "need"
]);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeArea(area: string) {
  switch (area) {
    case "a":
      return "A";
    case "b":
      return "B";
    case "mid":
      return "MID";
    case "banan":
      return "BANAN";
    case "car":
      return "CAR";
    case "ct":
      return "CT";
    case "ct-spawn":
      return "CT-SPAWN";
    case "t-spawn":
      return "T-SPAWN";
    case "connector":
      return "CONNECTOR";
    case "short":
      return "SHORT";
    case "long":
      return "LONG";
    case "window":
      return "WINDOW";
    case "jungle":
      return "JUNGLE";
    case "ramp":
      return "RAMP";
    default:
      return area.toUpperCase();
  }
}

function stringifySteps(steps: Prisma.JsonValue | null) {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps.map((step) => {
    if (typeof step === "string") {
      return step;
    }

    if (step && typeof step === "object" && "text" in step) {
      return String((step as { text?: unknown }).text ?? "");
    }

    return String(step);
  });
}

function buildSearchableText(lineup: {
  title: string;
  area: string | null;
  description?: string | null;
  fromPosition: string | null;
  targetPosition: string | null;
  tags: string[];
  aliases: string[];
  map: { name: string };
}) {
  return [
    lineup.title,
    lineup.area ?? "",
    lineup.description ?? "",
    lineup.fromPosition ?? "",
    lineup.targetPosition ?? "",
    lineup.map.name,
    ...lineup.tags,
    ...lineup.aliases
  ]
    .join(" ")
    .toLowerCase();
}

function countMatchedTokens(haystack: string, tokens: string[]) {
  return tokens.filter((token) => haystack.includes(token)).length;
}

function hasStructuredIntent(intent: SearchIntent) {
  return Boolean(intent.mapSlug || intent.utilityType || intent.area || intent.side || intent.difficulty);
}

function demoProtectionWhere(): Prisma.LineupWhereInput {
  return {
    NOT: {
      OR: [
        { slug: { startsWith: "demo-" } },
        { sourceName: { contains: "Demo", mode: Prisma.QueryMode.insensitive } },
        { tags: { has: "demo" } }
      ]
    }
  };
}

export function normalizeQuery(input: string) {
  let normalized = input.toLowerCase().trim();

  for (const entry of phraseSynonyms) {
    for (const variant of entry.variants) {
      normalized = normalized.replace(new RegExp(escapeRegExp(variant), "g"), entry.canonical);
    }
  }

  normalized = normalized
    .replace(/[.,/#!$%^&*;:{}=_`~()?"'\\[\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = normalized.split(" ").filter(Boolean);

  const canonicalTokens = tokens.flatMap((token) => {
    const match = tokenSynonyms.find((entry) => entry.variants.includes(token));
    return match ? match.canonical.split(" ") : token;
  });

  return canonicalTokens.join(" ").replace(/\s+/g, " ").trim();
}

export function parseSearchIntent(query: string): SearchIntent {
  const normalizedQuery = normalizeQuery(query);
  const tokens = normalizedQuery.split(" ").filter(Boolean);
  const tokenSet = new Set(tokens);

  const mapEntry = Object.entries(mapMetaByCanonical).find(([canonical]) => normalizedQuery.includes(canonical));
  const utilityEntry = Object.entries(utilityByCanonical).find(([canonical]) => tokenSet.has(canonical));
  const areaEntry = areaCanonicals.find((candidate) => tokenSet.has(candidate));
  const sideEntry = Object.entries(sideByCanonical).find(([canonical]) => tokenSet.has(canonical));
  const difficultyEntry = Object.entries(difficultyByCanonical).find(([canonical]) => tokenSet.has(canonical));

  return {
    map: mapEntry?.[1].name,
    mapSlug: mapEntry?.[1].slug,
    mapName: mapEntry?.[1].name,
    utilityType: utilityEntry?.[1],
    area: areaEntry ? normalizeArea(areaEntry) : undefined,
    side: sideEntry?.[1],
    difficulty: difficultyEntry?.[1]
  };
}

export function scoreLineup(
  lineup: {
    title: string;
    utilityType: UtilityType;
    area: string | null;
    fromPosition: string | null;
    targetPosition: string | null;
    tags: string[];
    aliases: string[];
    isVerified: boolean;
    status: LineupStatus;
    map: { slug: string; name: string };
  },
  intent: SearchIntent,
  normalizedQuery: string
) {
  const searchableText = buildSearchableText(lineup);
  let score = 0;

  if (intent.mapSlug && lineup.map.slug === intent.mapSlug) {
    score += 50;
  }

  if (intent.utilityType && lineup.utilityType === intent.utilityType) {
    score += 45;
  }

  if (intent.area && (lineup.area ?? "").toLowerCase().includes(intent.area.toLowerCase())) {
    score += 35;
  }

  if (intent.area && (lineup.fromPosition ?? "").toLowerCase().includes(intent.area.toLowerCase())) {
    score += 25;
  }

  if (intent.area && (lineup.targetPosition ?? "").toLowerCase().includes(intent.area.toLowerCase())) {
    score += 25;
  }

  if (lineup.tags.some((tag) => normalizedQuery.includes(tag.toLowerCase()))) {
    score += 20;
  }

  if (lineup.aliases.some((alias) => alias.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(alias.toLowerCase()))) {
    score += 20;
  }

  if (lineup.title.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(lineup.title.toLowerCase())) {
    score += 15;
  }

  if (lineup.status === LineupStatus.published) {
    score += 10;
  }

  if (lineup.isVerified) {
    score += 10;
  }

  for (const token of normalizedQuery.split(" ").filter(Boolean)) {
    if (genericTokens.has(token) || !searchableText.includes(token)) {
      continue;
    }

    score += 5;
  }

  return score;
}

export async function searchLineups(filtersOrQuery: SearchFilters | string) {
  const filters = typeof filtersOrQuery === "string" ? ({ query: filtersOrQuery } satisfies SearchFilters) : filtersOrQuery;
  const query = filters.query?.trim() ?? "";
  const deterministicQuery = normalizeQuery(query);
  const aiNormalized = await normalizeSearchQueryWithAI(query, deterministicQuery);
  const normalizedQuery = aiNormalized?.normalizedQuery ?? deterministicQuery;
  const parsedIntent = parseSearchIntent(normalizedQuery);

  const intent: SearchIntent = {
    ...parsedIntent,
    utilityType: filters.utilityType ?? aiNormalized?.utilityType ?? parsedIntent.utilityType,
    side: filters.side ?? aiNormalized?.side ?? parsedIntent.side,
    difficulty: filters.difficulty ?? aiNormalized?.difficulty ?? parsedIntent.difficulty,
    area: filters.area ?? aiNormalized?.area ?? parsedIntent.area
  };

  const tokens = normalizedQuery
    .split(" ")
    .filter(Boolean)
    .filter((token) => !genericTokens.has(token));

  const isPublicSearch = (filters.status ?? LineupStatus.published) === LineupStatus.published;
  const where: Prisma.LineupWhereInput = {
    status: filters.status ?? LineupStatus.published,
    ...(isPublicSearch ? demoProtectionWhere() : {})
  };

  if (filters.mapSlug ?? intent.mapSlug) {
    where.map = { slug: filters.mapSlug ?? intent.mapSlug };
  }

  if (filters.utilityType ?? intent.utilityType) {
    where.utilityType = filters.utilityType ?? intent.utilityType;
  }

  if (filters.side ?? intent.side) {
    where.OR = [{ side: filters.side ?? intent.side }, { side: Side.both }];
  }

  if (filters.difficulty ?? intent.difficulty) {
    where.difficulty = filters.difficulty ?? intent.difficulty;
  }

  if (filters.area ?? intent.area) {
    where.area = {
      contains: filters.area ?? intent.area,
      mode: Prisma.QueryMode.insensitive
    };
  }

  if (filters.verifiedOnly) {
    where.isVerified = true;
  }

  const lineups = await prisma.lineup.findMany({
    where,
    include: { map: true },
    take: 100,
    orderBy: [{ updatedAt: "desc" }]
  });

  const ranked = lineups
    .map((lineup) => {
      const searchableText = buildSearchableText(lineup);
      const matchedTokenCount = countMatchedTokens(searchableText, tokens);

      return {
        ...lineup,
        steps: stringifySteps(lineup.steps),
        score: query ? scoreLineup(lineup, intent, normalizedQuery) : 0,
        matchedTokenCount
      };
    })
    .filter((lineup) => {
      if (!query) {
        return true;
      }

      const matchedEnoughTokens = lineup.matchedTokenCount >= (tokens.length <= 1 ? tokens.length : 2);
      const structuredMatchCount = [
        intent.mapSlug && lineup.map.slug === intent.mapSlug,
        intent.utilityType && lineup.utilityType === intent.utilityType,
        intent.area && (lineup.area ?? "").toLowerCase().includes(intent.area.toLowerCase()),
        intent.side && (lineup.side === intent.side || lineup.side === Side.both),
        intent.difficulty && lineup.difficulty === intent.difficulty
      ].filter(Boolean).length;

      const strongStructuredMatch = hasStructuredIntent(intent) && (tokens.length <= 1 ? structuredMatchCount >= 1 : structuredMatchCount >= 2);
      return matchedEnoughTokens || strongStructuredMatch;
    })
    .sort((left, right) => right.score - left.score || Number(right.isVerified) - Number(left.isVerified));

  if (query) {
    await prisma.searchLog.create({
      data: {
        query,
        normalizedQuery,
        resultsCount: ranked.length
      }
    });
  }

  return {
    query,
    normalizedQuery,
    intent,
    results: ranked
  };
}
