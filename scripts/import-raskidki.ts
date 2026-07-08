import { readFile } from "fs/promises";
import path from "path";

import { externalLineupCandidateSchema } from "@/src/lib/schemas";
import { importJsonCandidates, ensureRaskidkiImportSource } from "@/src/lib/importers/websiteImporter";

async function main() {
  const sourceUrl =
    process.env.RASKIDKI_SOURCE_URL?.trim() || "https://xn----7sbbane1abpc1b0aig0a.xn--p1ai/raskidki-granat-counter-strike-2/";
  const inputPath = path.join(process.cwd(), "data", "raskidki-import.json");
  const source = await ensureRaskidkiImportSource(sourceUrl);
  const raw = await readFile(inputPath, "utf8");
  const parsed = JSON.parse(raw);
  const lineups = externalLineupCandidateSchema.array().parse(parsed);
  const result = await importJsonCandidates(source.id, lineups);

  console.log(
    JSON.stringify(
      {
        "[import]": "completed",
        inputPath,
        foundCount: result.foundCount,
        created: result.createdCount,
        updated: result.updatedCount,
        skipped: result.skippedCount,
        failed: result.errors.length,
        importedCount: result.importedCount,
        errorCount: result.errors.length
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
