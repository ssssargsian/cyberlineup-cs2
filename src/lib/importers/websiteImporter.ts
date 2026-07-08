import { ImportJobStatus, ImportSourceType } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

import { prisma } from "@/lib/prisma";
import { exportRaskidkiGranatSource } from "@/src/lib/importers/raskidkiGranatCrawler";
import { importLineupsToDatabase } from "@/src/lib/importers/importToDatabase";
import type { ExportRaskidkiResult, ImportResult } from "@/src/lib/importers/types";

const DEFAULT_JSON_PATH = path.join(process.cwd(), "data", "raskidki-import.json");

function sourceCanUseRaskidkiCrawler(source: { baseUrl: string; name: string; type: ImportSourceType }) {
  return source.type === ImportSourceType.website && source.baseUrl.includes("raskidki-granat-counter-strike-2");
}

export async function ensureRaskidkiImportSource(baseUrl: string) {
  return prisma.importSource.upsert({
    where: { name: "ГАЙД CS2 / Раскидка гранат CS2" },
    create: {
      name: "ГАЙД CS2 / Раскидка гранат CS2",
      baseUrl,
      type: ImportSourceType.website,
      isEnabled: true
    },
    update: {
      baseUrl
    }
  });
}

export async function exportSourceToJson(sourceId: number, outputPath = DEFAULT_JSON_PATH) {
  const source = await prisma.importSource.findUnique({ where: { id: sourceId } });

  if (!source) {
    throw new Error("Import source not found.");
  }

  if (!sourceCanUseRaskidkiCrawler(source)) {
    throw new Error(`No supported crawler for source ${source.name}`);
  }

  const result = await exportRaskidkiGranatSource(source.baseUrl);
  await writeFile(outputPath, JSON.stringify(result.lineups, null, 2), "utf8");
  return result;
}

export async function importJsonCandidates(sourceId: number, candidates: ExportRaskidkiResult["lineups"]) {
  const source = await prisma.importSource.findUnique({ where: { id: sourceId } });

  if (!source) {
    throw new Error("Import source not found.");
  }

  const job = await prisma.importJob.create({
    data: {
      sourceId: source.id,
      status: ImportJobStatus.running,
      startedAt: new Date()
    }
  });

  try {
    const imported = await importLineupsToDatabase(candidates);

    await prisma.importSource.update({
      where: { id: source.id },
      data: { lastImportedAt: new Date() }
    });

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: ImportJobStatus.completed,
        foundCount: imported.foundCount,
        importedCount: imported.importedCount,
        skippedCount: imported.skippedCount,
        errorMessage: imported.errors.join("\n") || null,
        finishedAt: new Date()
      }
    });

    return imported;
  } catch (error) {
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: ImportJobStatus.failed,
        errorMessage: error instanceof Error ? error.message : String(error),
        finishedAt: new Date()
      }
    });

    throw error;
  }
}

export async function syncWebsiteSource(sourceId: number, outputPath = DEFAULT_JSON_PATH) {
  const exported = await exportSourceToJson(sourceId, outputPath);
  const imported = await importJsonCandidates(sourceId, exported.lineups);

  return {
    sourceName: exported.sourceName,
    foundCount: exported.lineups.length,
    importedCount: imported.importedCount,
    skippedCount: imported.skippedCount,
    candidates: exported.lineups,
    errors: [...exported.errors, ...imported.errors]
  } satisfies ImportResult;
}

export async function runEnabledImports() {
  const sources = await prisma.importSource.findMany({
    where: { isEnabled: true, type: ImportSourceType.website },
    orderBy: { updatedAt: "desc" }
  });

  const results: ImportResult[] = [];

  for (const source of sources) {
    if (!sourceCanUseRaskidkiCrawler(source)) {
      continue;
    }

    results.push(await syncWebsiteSource(source.id));
  }

  return results;
}
