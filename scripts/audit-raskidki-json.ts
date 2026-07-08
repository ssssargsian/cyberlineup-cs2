import { readFile } from "fs/promises";
import path from "path";

import { externalLineupCandidateSchema } from "@/src/lib/schemas";

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});
}

function duplicateCount(values: string[]) {
  const counts = countBy(values.filter(Boolean));
  return Object.values(counts).filter((count) => count > 1).length;
}

async function main() {
  const inputPath = path.join(process.cwd(), "data", "raskidki-import.json");
  const raw = await readFile(inputPath, "utf8");
  const parsed = externalLineupCandidateSchema.array().safeParse(JSON.parse(raw));

  if (!parsed.success) {
    console.error("[audit] invalid JSON shape");
    console.error(parsed.error.message);
    process.exit(1);
  }

  const lineups = parsed.data;
  const byMap = countBy(lineups.map((lineup) => lineup.map));
  const byUtilityType = countBy(lineups.map((lineup) => lineup.utilityType));
  const withPreview = lineups.filter((lineup) => Boolean(lineup.previewImageUrl)).length;
  const withImages = lineups.filter((lineup) => (lineup.images?.length ?? 0) > 0).length;
  const withSteps = lineups.filter((lineup) => (lineup.steps?.length ?? 0) > 0).length;
  const withStepImages = lineups.filter((lineup) => lineup.steps?.some((step) => Boolean(step.imageUrl))).length;
  const withoutImages = lineups.length - withImages;
  const unknownMap = lineups.filter((lineup) => lineup.map.toLowerCase() === "unknown").length;
  const unknownUtilityType = lineups.filter((lineup) => lineup.utilityType === "unknown").length;
  const duplicateSourceUrl = duplicateCount(lineups.map((lineup) => lineup.sourceUrl));
  const duplicateSlug = duplicateCount(lineups.map((lineup) => lineup.slug));

  console.log(`[audit] file: ${inputPath}`);
  console.log(`Total lineups: ${lineups.length}`);

  for (const [map, count] of Object.entries(byMap).sort((left, right) => right[1] - left[1])) {
    console.log(`${map}: ${count}`);
  }

  for (const [utilityType, count] of Object.entries(byUtilityType).sort((left, right) => right[1] - left[1])) {
    console.log(`${utilityType}: ${count}`);
  }

  console.log(`With preview: ${withPreview}`);
  console.log(`With images: ${withImages}`);
  console.log(`With steps: ${withSteps}`);
  console.log(`With step images: ${withStepImages}`);
  console.log(`Without images: ${withoutImages}`);
  console.log(`Duplicate sourceUrl: ${duplicateSourceUrl}`);
  console.log(`Duplicate slug: ${duplicateSlug}`);
  console.log(`Unknown map: ${unknownMap}`);
  console.log(`Unknown utilityType: ${unknownUtilityType}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
