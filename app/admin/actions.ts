"use server";

import {
  Difficulty,
  ImportSourceType,
  LineupStatus,
  Prisma,
  Side,
  UtilityType
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearAdminSession, requireAdmin, setAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { nullableString, toTextArray } from "@/lib/utils";
import { importJsonCandidates, syncWebsiteSource } from "@/src/lib/importers/websiteImporter";
import { importSourceFormSchema, lineupFormSchema, mapFormSchema } from "@/src/lib/schemas";
import { readFile } from "fs/promises";
import path from "path";

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseStepsInput(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  if (raw.startsWith("[")) {
    return JSON.parse(raw);
  }

  const lines = toTextArray(value);
  return lines.length ? lines : null;
}

function parseLineupFormData(formData: FormData) {
  return lineupFormSchema.parse({
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    mapId: Number(formData.get("mapId")),
    utilityType: String(formData.get("utilityType")) as UtilityType,
    side: String(formData.get("side")) as Side,
    area: nullableString(formData.get("area")),
    fromPosition: nullableString(formData.get("fromPosition")),
    targetPosition: nullableString(formData.get("targetPosition")),
    difficulty: String(formData.get("difficulty")) as Difficulty,
    throwType: nullableString(formData.get("throwType")),
    description: nullableString(formData.get("description")),
    steps: parseStepsInput(formData.get("steps")),
    videoUrl: nullableString(formData.get("videoUrl")),
    previewImageUrl: nullableString(formData.get("previewImageUrl")),
    aimImageUrl: nullableString(formData.get("aimImageUrl")),
    positionImageUrl: nullableString(formData.get("positionImageUrl")),
    tags: toTextArray(formData.get("tags")),
    aliases: toTextArray(formData.get("aliases")),
    isVerified: parseBoolean(formData.get("isVerified")),
    status: String(formData.get("status")) as LineupStatus,
    sourceName: nullableString(formData.get("sourceName")),
    sourceUrl: nullableString(formData.get("sourceUrl"))
  });
}

function parseMapFormData(formData: FormData) {
  return mapFormSchema.parse({
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: nullableString(formData.get("description")),
    imageUrl: nullableString(formData.get("imageUrl"))
  });
}

function parseSourceFormData(formData: FormData) {
  return importSourceFormSchema.parse({
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    name: String(formData.get("name") ?? ""),
    baseUrl: String(formData.get("baseUrl") ?? ""),
    type: String(formData.get("type")) as ImportSourceType,
    isEnabled: parseBoolean(formData.get("isEnabled"))
  });
}

export async function loginAdminAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin?error=invalid-password");
  }

  setAdminSession();
  redirect("/admin");
}

export async function logoutAdminAction() {
  clearAdminSession();
  redirect("/admin");
}

export async function createMapAction(formData: FormData) {
  requireAdmin();
  const data = parseMapFormData(formData);

  await prisma.map.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl
    }
  });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin#maps");
}

export async function updateMapAction(formData: FormData) {
  requireAdmin();
  const data = parseMapFormData(formData);

  await prisma.map.update({
    where: { id: data.id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl
    }
  });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin#maps");
}

export async function deleteMapAction(formData: FormData) {
  requireAdmin();
  const id = Number(formData.get("id"));

  await prisma.map.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function createLineupAction(formData: FormData) {
  requireAdmin();
  const data = parseLineupFormData(formData);

  const lineup = await prisma.lineup.create({
    data: {
      title: data.title,
      slug: data.slug,
      mapId: data.mapId,
      utilityType: data.utilityType,
      side: data.side,
      area: data.area,
      fromPosition: data.fromPosition,
      targetPosition: data.targetPosition,
      difficulty: data.difficulty,
      throwType: data.throwType,
      description: data.description,
      steps: data.steps ?? Prisma.JsonNull,
      videoUrl: data.videoUrl,
      previewImageUrl: data.previewImageUrl,
      aimImageUrl: data.aimImageUrl,
      positionImageUrl: data.positionImageUrl,
      tags: data.tags,
      aliases: data.aliases,
      isVerified: data.isVerified,
      status: data.status,
      sourceName: data.sourceName,
      sourceUrl: data.sourceUrl,
      importedAt: data.sourceUrl ? new Date() : null
    }
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath(`/lineups/${lineup.slug}`);
  redirect(`/admin/lineups/${lineup.id}/edit`);
}

export async function updateLineupAction(formData: FormData) {
  requireAdmin();
  const data = parseLineupFormData(formData);

  const lineup = await prisma.lineup.update({
    where: { id: data.id },
    data: {
      title: data.title,
      slug: data.slug,
      mapId: data.mapId,
      utilityType: data.utilityType,
      side: data.side,
      area: data.area,
      fromPosition: data.fromPosition,
      targetPosition: data.targetPosition,
      difficulty: data.difficulty,
      throwType: data.throwType,
      description: data.description,
      steps: data.steps ?? Prisma.JsonNull,
      videoUrl: data.videoUrl,
      previewImageUrl: data.previewImageUrl,
      aimImageUrl: data.aimImageUrl,
      positionImageUrl: data.positionImageUrl,
      tags: data.tags,
      aliases: data.aliases,
      isVerified: data.isVerified,
      status: data.status,
      sourceName: data.sourceName,
      sourceUrl: data.sourceUrl,
      importedAt: data.sourceUrl ? new Date() : null
    }
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath(`/maps/${lineup.mapId}`);
  revalidatePath(`/lineups/${lineup.slug}`);
  redirect(`/admin/lineups/${lineup.id}/edit`);
}

export async function deleteLineupAction(formData: FormData) {
  requireAdmin();
  const id = Number(formData.get("id"));

  const lineup = await prisma.lineup.findUnique({ where: { id } });
  await prisma.lineup.delete({ where: { id } });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/search");

  if (lineup) {
    revalidatePath(`/lineups/${lineup.slug}`);
  }
}

export async function publishLineupAction(formData: FormData) {
  requireAdmin();
  const id = Number(formData.get("id"));

  await prisma.lineup.update({
    where: { id },
    data: {
      status: LineupStatus.published
    }
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/search");
}

export async function rejectLineupAction(formData: FormData) {
  requireAdmin();
  const id = Number(formData.get("id"));

  await prisma.lineup.update({
    where: { id },
    data: {
      status: LineupStatus.rejected
    }
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/search");
}

export async function publishAllImportedLineupsAction() {
  requireAdmin();

  await prisma.lineup.updateMany({
    where: {
      status: LineupStatus.pending_review,
      OR: [
        { sourceName: "ГАЙД CS2" },
        { sourceName: "ГАЙД CS2 / Раскидка гранат CS2" },
        { sourceUrl: { contains: "xn----7sbbane1abpc1b0aig0a.xn--p1ai" } }
      ],
      NOT: {
        OR: [
          { slug: { startsWith: "demo-" } },
          { sourceName: { contains: "Demo", mode: "insensitive" } },
          { tags: { has: "demo" } }
        ]
      }
    },
    data: {
      status: LineupStatus.published
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/imports");
  revalidatePath("/");
  revalidatePath("/search");
}

export async function hideDemoLineupsAction() {
  requireAdmin();

  await prisma.lineup.updateMany({
    where: {
      OR: [
        { slug: { startsWith: "demo-" } },
        { sourceName: { contains: "Demo", mode: "insensitive" } },
        { tags: { has: "demo" } }
      ]
    },
    data: {
      status: LineupStatus.rejected
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/imports");
  revalidatePath("/");
  revalidatePath("/search");
}

export async function createImportSourceAction(formData: FormData) {
  requireAdmin();
  const data = parseSourceFormData(formData);

  await prisma.importSource.create({
    data: {
      name: data.name,
      baseUrl: data.baseUrl,
      type: data.type,
      isEnabled: data.isEnabled
    }
  });

  revalidatePath("/admin");
  redirect("/admin#sources");
}

export async function updateImportSourceAction(formData: FormData) {
  requireAdmin();
  const data = parseSourceFormData(formData);

  await prisma.importSource.update({
    where: { id: data.id },
    data: {
      name: data.name,
      baseUrl: data.baseUrl,
      type: data.type,
      isEnabled: data.isEnabled
    }
  });

  revalidatePath("/admin");
  redirect("/admin#sources");
}

export async function runImportAction() {
  requireAdmin();
  const source = await prisma.importSource.findFirst({
    where: { isEnabled: true, type: ImportSourceType.website, baseUrl: { contains: "raskidki-granat-counter-strike-2" } },
    orderBy: { updatedAt: "desc" }
  });

  if (!source) {
    throw new Error("Активный источник для импорта не найден.");
  }

  await syncWebsiteSource(source.id);
  revalidatePath("/admin");
  revalidatePath("/admin/imports");
  revalidatePath("/");
  revalidatePath("/search");
  redirect("/admin#jobs");
}

export async function exportRaskidkiJsonAction() {
  requireAdmin();
  const source = await prisma.importSource.findFirst({
    where: { isEnabled: true, type: ImportSourceType.website, baseUrl: { contains: "raskidki-granat-counter-strike-2" } },
    orderBy: { updatedAt: "desc" }
  });

  if (!source) {
    throw new Error("Активный источник для экспорта JSON не найден.");
  }

  const { exportSourceToJson } = await import("@/src/lib/importers/websiteImporter");
  await exportSourceToJson(source.id);
  revalidatePath("/admin/imports");
  redirect("/admin/imports");
}

export async function importRaskidkiJsonAction() {
  requireAdmin();
  const source = await prisma.importSource.findFirst({
    where: { isEnabled: true, type: ImportSourceType.website, baseUrl: { contains: "raskidki-granat-counter-strike-2" } },
    orderBy: { updatedAt: "desc" }
  });

  if (!source) {
    throw new Error("Активный источник для импорта JSON не найден.");
  }

  const inputPath = path.join(process.cwd(), "data", "raskidki-import.json");
  const raw = await readFile(inputPath, "utf8");
  const { externalLineupCandidateSchema } = await import("@/src/lib/schemas");
  const lineups = externalLineupCandidateSchema.array().parse(JSON.parse(raw));
  await importJsonCandidates(source.id, lineups);
  revalidatePath("/admin");
  revalidatePath("/admin/imports");
  revalidatePath("/");
  revalidatePath("/search");
  redirect("/admin/imports");
}

export async function syncRaskidkiAction() {
  requireAdmin();
  const source = await prisma.importSource.findFirst({
    where: { isEnabled: true, type: ImportSourceType.website, baseUrl: { contains: "raskidki-granat-counter-strike-2" } },
    orderBy: { updatedAt: "desc" }
  });

  if (!source) {
    throw new Error("Активный источник для синхронизации не найден.");
  }

  await syncWebsiteSource(source.id);
  revalidatePath("/admin");
  revalidatePath("/admin/imports");
  revalidatePath("/");
  revalidatePath("/search");
  redirect("/admin/imports");
}
