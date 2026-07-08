import { Difficulty, ImportSourceType, LineupStatus, Side, UtilityType } from "@prisma/client";
import { z } from "zod";

export const lineupStepSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
  imageUrl: z.string().url().nullable(),
  sourceImageUrl: z.string().url().nullable().optional(),
  localImageUrl: z.string().nullable().optional()
});

export const lineupImageSchema = z.object({
  url: z.string().url(),
  sourceUrl: z.string().url(),
  localUrl: z.string().nullable(),
  alt: z.string(),
  role: z.enum(["preview", "position", "aim", "step", "gallery"]),
  stepIndex: z.number().int().nullable()
});

export const lineupFormSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3),
  slug: z.string().min(3),
  mapId: z.number().int().positive(),
  utilityType: z.nativeEnum(UtilityType),
  side: z.nativeEnum(Side),
  area: z.string().trim().nullable(),
  fromPosition: z.string().trim().nullable(),
  targetPosition: z.string().trim().nullable(),
  difficulty: z.nativeEnum(Difficulty),
  throwType: z.string().trim().nullable(),
  description: z.string().trim().nullable(),
  steps: z.union([z.array(z.string().min(1)), z.array(lineupStepSchema)]).nullable(),
  images: z.array(lineupImageSchema).nullable().optional(),
  videoUrl: z.string().url().nullable(),
  previewImageUrl: z.string().url().nullable(),
  aimImageUrl: z.string().url().nullable(),
  positionImageUrl: z.string().url().nullable(),
  tags: z.array(z.string().min(1)),
  aliases: z.array(z.string().min(1)),
  isVerified: z.boolean(),
  status: z.nativeEnum(LineupStatus),
  sourceName: z.string().trim().nullable(),
  sourceUrl: z.string().url().nullable()
});

export const mapFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().trim().nullable(),
  imageUrl: z.string().url().nullable()
});

export const importSourceFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2),
  baseUrl: z.string().url(),
  type: z.nativeEnum(ImportSourceType),
  isEnabled: z.boolean()
});

export const externalLineupCandidateSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  map: z.string().min(2),
  mapSlug: z.string().optional(),
  utilityType: z.nativeEnum(UtilityType),
  side: z.nativeEnum(Side),
  area: z.string().nullable(),
  fromPosition: z.string().nullable(),
  targetPosition: z.string().nullable(),
  difficulty: z.nativeEnum(Difficulty),
  throwType: z.string().nullable(),
  description: z.string().nullable(),
  steps: z.array(lineupStepSchema).nullable(),
  images: z.array(lineupImageSchema).nullable(),
  videoUrl: z.string().url().nullable(),
  previewImageUrl: z.string().url().nullable(),
  aimImageUrl: z.string().url().nullable(),
  positionImageUrl: z.string().url().nullable(),
  sourceUrl: z.string().url(),
  sourceName: z.string().min(2),
  tags: z.array(z.string()),
  aliases: z.array(z.string()),
  status: z.nativeEnum(LineupStatus),
  isVerified: z.boolean(),
  importedAt: z.string().datetime(),
  rawTitle: z.string().nullable().optional(),
  rawHtml: z.string().nullable().optional()
});
