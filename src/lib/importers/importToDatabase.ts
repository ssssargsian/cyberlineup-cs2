import { Difficulty, LineupStatus, Prisma, Side, UtilityType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { externalLineupCandidateSchema } from "@/src/lib/schemas";
import type { ExternalLineupCandidate, ImportToDatabaseResult } from "@/src/lib/importers/types";

function mergeUnique(left: string[], right: string[]) {
  return Array.from(new Set([...left, ...right].filter(Boolean)));
}

function isEmptyText(value: string | null | undefined) {
  return !value || !value.trim();
}

function isUnknownEnum<T extends string>(value: T | null | undefined) {
  return !value || value === ("unknown" as T);
}

function hasSteps(value: Prisma.JsonValue | null) {
  return Array.isArray(value) && value.length > 0;
}

function hasImages(value: Prisma.JsonValue | null) {
  return Array.isArray(value) && value.length > 0;
}

function shouldKeepExistingStatus(status: LineupStatus) {
  return status === LineupStatus.published || status === LineupStatus.rejected;
}

function shouldForceUpdateImported() {
  return process.env.FORCE_UPDATE_IMPORTED === "true";
}

function importedStatus() {
  return process.env.AUTO_PUBLISH_IMPORTED === "true" ? LineupStatus.published : LineupStatus.pending_review;
}

function toJsonArray<T>(value: T[] | null | undefined): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  return value?.length ? (value as unknown as Prisma.InputJsonValue) : Prisma.JsonNull;
}

function toDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function ensureMap(mapName: string, mapSlug?: string) {
  const existing = await prisma.map.findFirst({
    where: {
      OR: [{ slug: mapSlug ?? "" }, { name: mapName }]
    }
  });

  if (existing) {
    return existing;
  }

  return prisma.map.create({
    data: {
      name: mapName,
      slug: mapSlug ?? mapName.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-")
    }
  });
}

export async function importLineupsToDatabase(lineups: ExternalLineupCandidate[]): Promise<ImportToDatabaseResult> {
  const errors: string[] = [];
  let importedCount = 0;
  let skippedCount = 0;
  let createdCount = 0;
  let updatedCount = 0;

  for (const rawLineup of lineups) {
    const parsed = externalLineupCandidateSchema.safeParse(rawLineup);

    if (!parsed.success) {
      skippedCount += 1;
      errors.push(parsed.error.message);
      continue;
    }

    const lineup = parsed.data;

    try {
      const map = await ensureMap(lineup.map, lineup.mapSlug);
      const existing = await prisma.lineup.findFirst({
        where: {
          OR: [{ sourceUrl: lineup.sourceUrl }, { slug: lineup.slug }]
        }
      });

      if (!existing) {
        await prisma.lineup.create({
          data: {
            title: lineup.title,
            slug: lineup.slug,
            mapId: map.id,
            utilityType: lineup.utilityType,
            side: lineup.side,
            area: lineup.area,
            fromPosition: lineup.fromPosition,
            targetPosition: lineup.targetPosition,
            difficulty: lineup.difficulty,
            throwType: lineup.throwType,
            description: lineup.description,
            steps: toJsonArray(lineup.steps),
            images: toJsonArray(lineup.images),
            videoUrl: lineup.videoUrl,
            previewImageUrl: lineup.previewImageUrl,
            aimImageUrl: lineup.aimImageUrl,
            positionImageUrl: lineup.positionImageUrl,
            tags: lineup.tags,
            aliases: lineup.aliases,
            status: importedStatus(),
            isVerified: false,
            sourceName: lineup.sourceName,
            sourceUrl: lineup.sourceUrl,
            importedAt: toDate(lineup.importedAt)
          }
        });

        importedCount += 1;
        createdCount += 1;
        continue;
      }

      const forceUpdateImported = shouldForceUpdateImported();
      const nextStatus = shouldKeepExistingStatus(existing.status) ? existing.status : importedStatus();

      await prisma.lineup.update({
        where: { id: existing.id },
        data: {
          title: isEmptyText(existing.title) ? lineup.title : existing.title,
          slug: existing.slug,
          mapId: existing.mapId || map.id,
          utilityType: isUnknownEnum(existing.utilityType) ? lineup.utilityType : existing.utilityType,
          side: isUnknownEnum(existing.side) ? lineup.side : existing.side,
          area: isEmptyText(existing.area) ? lineup.area : existing.area,
          fromPosition: isEmptyText(existing.fromPosition) ? lineup.fromPosition : existing.fromPosition,
          targetPosition: isEmptyText(existing.targetPosition) ? lineup.targetPosition : existing.targetPosition,
          difficulty: isUnknownEnum(existing.difficulty) ? lineup.difficulty : existing.difficulty,
          throwType: isEmptyText(existing.throwType) ? lineup.throwType : existing.throwType,
          description: isEmptyText(existing.description) ? lineup.description : existing.description,
          steps: hasSteps(existing.steps) && !forceUpdateImported ? (existing.steps as Prisma.InputJsonValue) : toJsonArray(lineup.steps),
          images: hasImages(existing.images) && !forceUpdateImported ? (existing.images as Prisma.InputJsonValue) : toJsonArray(lineup.images),
          videoUrl: isEmptyText(existing.videoUrl) ? lineup.videoUrl : existing.videoUrl,
          previewImageUrl: isEmptyText(existing.previewImageUrl) ? lineup.previewImageUrl : existing.previewImageUrl,
          aimImageUrl: isEmptyText(existing.aimImageUrl) ? lineup.aimImageUrl : existing.aimImageUrl,
          positionImageUrl: isEmptyText(existing.positionImageUrl) ? lineup.positionImageUrl : existing.positionImageUrl,
          tags: mergeUnique(existing.tags, lineup.tags),
          aliases: mergeUnique(existing.aliases, lineup.aliases),
          status: nextStatus,
          isVerified: existing.isVerified,
          sourceName: existing.sourceName ?? lineup.sourceName,
          sourceUrl: existing.sourceUrl ?? lineup.sourceUrl,
          importedAt: toDate(lineup.importedAt)
        }
      });

      importedCount += 1;
      updatedCount += 1;
    } catch (error) {
      skippedCount += 1;
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return {
    foundCount: lineups.length,
    importedCount,
    skippedCount,
    createdCount,
    updatedCount,
    errors
  };
}

export function normalizeUtilityTypeForImport(value: string | null | undefined) {
  switch (value) {
    case "smoke":
      return UtilityType.smoke;
    case "flash":
      return UtilityType.flash;
    case "molotov":
      return UtilityType.molotov;
    case "he":
      return UtilityType.he;
    case "oneway":
      return UtilityType.oneway;
    default:
      return UtilityType.unknown;
  }
}

export function normalizeSideForImport(value: string | null | undefined) {
  switch (value) {
    case "t":
      return Side.t;
    case "ct":
      return Side.ct;
    case "both":
      return Side.both;
    default:
      return Side.unknown;
  }
}

export function normalizeDifficultyForImport(value: string | null | undefined) {
  switch (value) {
    case "easy":
      return Difficulty.easy;
    case "medium":
      return Difficulty.medium;
    case "hard":
      return Difficulty.hard;
    default:
      return Difficulty.unknown;
  }
}
