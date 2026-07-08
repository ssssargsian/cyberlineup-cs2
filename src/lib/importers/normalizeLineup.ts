import { Difficulty, LineupStatus, Side, UtilityType } from "@prisma/client";

import { safeLatinSlug, slugify, stableHash, toAbsoluteUrl } from "@/lib/utils";
import type { ExternalLineupCandidate, LineupImage, LineupStep } from "@/src/lib/importers/types";

const SOURCE_NAME = "ГАЙД CS2";

const mapMatchers = [
  { keywords: ["dust 2", "dust2", "dust-2"], name: "Dust 2", slug: "dust-2" },
  { keywords: ["inferno"], name: "Inferno", slug: "inferno" },
  { keywords: ["mirage"], name: "Mirage", slug: "mirage" },
  { keywords: ["ancient"], name: "Ancient", slug: "ancient" },
  { keywords: ["vertigo"], name: "Vertigo", slug: "vertigo" },
  { keywords: ["train"], name: "Train", slug: "train" },
  { keywords: ["nuke"], name: "Nuke", slug: "nuke" },
  { keywords: ["overpass"], name: "Overpass", slug: "overpass" },
  { keywords: ["anubis"], name: "Anubis", slug: "anubis" },
  { keywords: ["office"], name: "Office", slug: "office" }
] as const;

const utilityMatchers = [
  { keywords: ["smoke"], value: UtilityType.smoke },
  { keywords: ["flash"], value: UtilityType.flash },
  { keywords: ["molotov"], value: UtilityType.molotov },
  { keywords: ["hegrenade", " he ", "he ", " he", "hae", "хе"], value: UtilityType.he },
  { keywords: ["oneway", "one way"], value: UtilityType.oneway },
  { keywords: ["reveal", "развей"], value: UtilityType.unknown }
] as const;

const areaMatchers = [
  { keywords: ["(b)", " b-site", " b site", " база б", " b"], value: "B" },
  { keywords: ["(a)", " a-site", " a site", " база а", " a"], value: "A" },
  { keywords: ["mid"], value: "MID" },
  { keywords: ["banan", "banana"], value: "BANAN" },
  { keywords: ["car"], value: "CAR" },
  { keywords: ["ct-spawn"], value: "CT-SPAWN" },
  { keywords: ["ct"], value: "CT" },
  { keywords: ["t-spawn", "t-zero"], value: "T-SPAWN" },
  { keywords: ["connector"], value: "CONNECTOR" },
  { keywords: ["short"], value: "SHORT" },
  { keywords: ["long"], value: "LONG" },
  { keywords: ["window"], value: "WINDOW" },
  { keywords: ["jungle"], value: "JUNGLE" },
  { keywords: ["ramp"], value: "RAMP" },
  { keywords: ["library"], value: "LIBRARY" },
  { keywords: ["market"], value: "MARKET" },
  { keywords: ["arch"], value: "ARCH" },
  { keywords: ["site"], value: "SITE" }
] as const;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function findMapFromInput(...values: Array<string | null | undefined>) {
  const joined = values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return mapMatchers.find((entry) => entry.keywords.some((keyword) => joined.includes(keyword)));
}

function findUtilityType(...values: Array<string | null | undefined>) {
  const joined = ` ${values
    .filter(Boolean)
    .join(" ")
    .toLowerCase()} `;

  return utilityMatchers.find((entry) => entry.keywords.some((keyword) => joined.includes(keyword)))?.value ?? UtilityType.unknown;
}

function extractFromTo(title: string) {
  const normalized = normalizeWhitespace(title);
  const match = normalized.match(/(?:smoke|flash|molotov|hegrenade|he|oneway|one way|reveal)\s+от\s+(.+?)\s+на\s+(.+)/i);

  if (match) {
    return {
      fromPosition: normalizeWhitespace(match[1]),
      targetPosition: normalizeWhitespace(match[2])
    };
  }

  const fallback = normalized.match(/от\s+(.+?)\s+на\s+(.+)/i);
  return {
    fromPosition: fallback ? normalizeWhitespace(fallback[1]) : null,
    targetPosition: fallback ? normalizeWhitespace(fallback[2]) : null
  };
}

function extractArea(targetPosition: string | null, title: string) {
  const joined = `${targetPosition ?? ""} ${title}`.toLowerCase();

  const bracket = joined.match(/\(([a-z0-9 -]+)\)/i);
  if (bracket) {
    const normalizedBracket = bracket[1].replace(/\s+/g, "-");
    if (normalizedBracket === "a") return "A";
    if (normalizedBracket === "b") return "B";
    if (normalizedBracket === "mid") return "MID";
    if (normalizedBracket === "t") return "T";
    if (normalizedBracket === "ct") return "CT";
  }

  return areaMatchers.find((entry) => entry.keywords.some((keyword) => joined.includes(keyword)))?.value ?? null;
}

function extractSide(fromPosition: string | null, targetPosition: string | null) {
  const joined = `${fromPosition ?? ""} ${targetPosition ?? ""}`.toLowerCase();

  if (/\(ct\)|ct-spawn|coffins|library|pit|site|back site/.test(joined)) {
    return Side.ct;
  }

  if (/\(t\)|t-spawn|t-zero|apps|ramp|outside|upper tunnel|lower tunnel/.test(joined)) {
    return Side.t;
  }

  return Side.unknown;
}

function normalizeStepTitle(title: string) {
  return normalizeWhitespace(title.replace(/\s+/g, " "));
}

function buildAliases(mapName: string, utilityType: UtilityType, fromPosition: string | null, targetPosition: string | null, area: string | null, title: string) {
  const utilityLabel =
    utilityType === UtilityType.oneway ? "ванвей" : utilityType === UtilityType.molotov ? "молик" : utilityType === UtilityType.flash ? "флеш" : utilityType === UtilityType.he ? "хаешка" : "смок";
  const mapAlias = mapName.toLowerCase();
  const aliases = new Set<string>([
    title,
    `${utilityLabel} ${mapAlias}`,
    `${utilityLabel} ${mapAlias} ${area ?? ""}`.trim(),
    `${utilityLabel} от ${fromPosition ?? "позиции"} на ${targetPosition ?? "цель"} ${mapAlias}`.trim(),
    `${utilityType} ${mapAlias} ${targetPosition ?? ""}`.trim()
  ]);

  return Array.from(aliases).map((value) => normalizeWhitespace(value));
}

function buildTags(mapSlug: string, utilityType: UtilityType, fromPosition: string | null, targetPosition: string | null, area: string | null) {
  return Array.from(
    new Set(
      [
        mapSlug,
        utilityType,
        area?.toLowerCase(),
        fromPosition?.toLowerCase().replace(/[^a-z0-9а-яё-]+/gi, "-"),
        targetPosition?.toLowerCase().replace(/[^a-z0-9а-яё-]+/gi, "-")
      ].filter(Boolean) as string[]
    )
  );
}

function cleanupDescription(description: string | null | undefined) {
  if (!description) {
    return null;
  }

  const compact = normalizeWhitespace(description);
  const boilerplateMatchers = [
    "раскидки гранат в игре counter-strike 2 являются важной частью",
    "существуют различные типы гранат",
    "для освоения грамотных раскидок важно изучить карты",
    "я зарабатываю на размещении рекламы",
    "регистрируйся по моей партнерской ссылке"
  ];

  if (boilerplateMatchers.some((pattern) => compact.toLowerCase().includes(pattern))) {
    return null;
  }

  return compact;
}

export function normalizeLineup(input: {
  title: string;
  sourceUrl: string;
  sourceName?: string | null;
  pageUrl?: string | null;
  mapName?: string | null;
  mapSlug?: string | null;
  utilityType?: UtilityType | null;
  fromPosition?: string | null;
  targetPosition?: string | null;
  area?: string | null;
  description?: string | null;
  steps?: LineupStep[] | null;
  images?: LineupImage[] | null;
  videoUrl?: string | null;
  previewImageUrl?: string | null;
  aimImageUrl?: string | null;
  positionImageUrl?: string | null;
  importedAt?: Date;
  rawHtml?: string | null;
}) {
  const normalizedTitle = normalizeWhitespace(input.title.replace(/^раскидка гранат на карте\s+/i, ""));
  const fromTo = extractFromTo(normalizedTitle);
  const matchedMap = findMapFromInput(input.mapName, input.mapSlug, input.sourceUrl, normalizedTitle);
  const mapName = input.mapName ?? matchedMap?.name ?? "Unknown";
  const mapSlug = input.mapSlug ?? matchedMap?.slug;
  const utilityType = input.utilityType ?? findUtilityType(normalizedTitle, input.sourceUrl);
  const fromPosition = input.fromPosition ?? fromTo.fromPosition;
  const targetPosition = input.targetPosition ?? fromTo.targetPosition;
  const area = input.area ?? extractArea(targetPosition, normalizedTitle);
  const side = extractSide(fromPosition, targetPosition);
  const slugBase = `${normalizedTitle} ${mapSlug ?? mapName}`.trim();
  const slug = safeLatinSlug(slugBase, stableHash(input.sourceUrl));
  const previewImageUrl = toAbsoluteUrl(input.pageUrl ?? input.sourceUrl, input.previewImageUrl);
  const aimImageUrl = toAbsoluteUrl(input.pageUrl ?? input.sourceUrl, input.aimImageUrl);
  const positionImageUrl = toAbsoluteUrl(input.pageUrl ?? input.sourceUrl, input.positionImageUrl);
  const videoUrl = toAbsoluteUrl(input.pageUrl ?? input.sourceUrl, input.videoUrl);
  const steps = input.steps?.map((step) => {
    const imageUrl = toAbsoluteUrl(input.pageUrl ?? input.sourceUrl, step.imageUrl);

    return {
      title: normalizeStepTitle(step.title),
      text: cleanupDescription(step.text) ?? normalizeStepTitle(step.title),
      imageUrl,
      sourceImageUrl: toAbsoluteUrl(input.pageUrl ?? input.sourceUrl, step.sourceImageUrl ?? step.imageUrl),
      localImageUrl: step.localImageUrl ?? null
    };
  }) ?? null;
  const imageEntries = new Map<string, LineupImage>();

  for (const [index, step] of (steps ?? []).entries()) {
    if (!step.imageUrl) {
      continue;
    }

    imageEntries.set(step.imageUrl, {
      url: step.localImageUrl ?? step.imageUrl,
      sourceUrl: step.sourceImageUrl ?? step.imageUrl,
      localUrl: step.localImageUrl ?? null,
      alt: `${normalizedTitle} — ${step.title}`,
      role: "step",
      stepIndex: index
    });
  }

  for (const image of input.images ?? []) {
    const absoluteUrl = toAbsoluteUrl(input.pageUrl ?? input.sourceUrl, image.url);
    const sourceUrl = toAbsoluteUrl(input.pageUrl ?? input.sourceUrl, image.sourceUrl);

    if (!absoluteUrl || !sourceUrl) {
      continue;
    }

    imageEntries.set(absoluteUrl, {
      url: image.localUrl ?? absoluteUrl,
      sourceUrl,
      localUrl: image.localUrl ?? null,
      alt: image.alt || normalizedTitle,
      role: image.role,
      stepIndex: image.stepIndex
    });
  }

  const images = Array.from(imageEntries.values());
  const description = cleanupDescription(input.description);
  const importedAt = (input.importedAt ?? new Date()).toISOString();
  const status =
    mapSlug && utilityType !== UtilityType.unknown && (area || fromPosition || targetPosition) ? LineupStatus.pending_review : LineupStatus.draft;

  return {
    title: normalizedTitle,
    slug,
    map: mapName,
    mapSlug,
    utilityType,
    side,
    area,
    fromPosition,
    targetPosition,
    difficulty: Difficulty.unknown,
    throwType: steps?.some((step) => /jumpthrow/i.test(step.text)) ? "jumpthrow" : null,
    description,
    steps,
    images: images.length ? images : null,
    videoUrl,
    previewImageUrl,
    aimImageUrl,
    positionImageUrl,
    tags: buildTags(mapSlug ?? slugify(mapName), utilityType, fromPosition, targetPosition, area),
    aliases: buildAliases(mapName, utilityType, fromPosition, targetPosition, area, normalizedTitle),
    status,
    isVerified: false,
    sourceName: input.sourceName?.trim() || SOURCE_NAME,
    sourceUrl: input.sourceUrl,
    importedAt,
    rawTitle: input.title,
    rawHtml: input.rawHtml ?? null
  } satisfies ExternalLineupCandidate;
}
