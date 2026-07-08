import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { exportRaskidkiGranatSource } from "@/src/lib/importers/raskidkiGranatCrawler";
import { ensureRaskidkiImportSource } from "@/src/lib/importers/websiteImporter";

async function main() {
  const sourceUrl =
    process.env.RASKIDKI_SOURCE_URL?.trim() || "https://xn----7sbbane1abpc1b0aig0a.xn--p1ai/raskidki-granat-counter-strike-2/";
  const outputPath = path.join(process.cwd(), "data", "raskidki-import.json");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await ensureRaskidkiImportSource(sourceUrl);

  const result = await exportRaskidkiGranatSource(sourceUrl);
  await writeFile(outputPath, JSON.stringify(result.lineups, null, 2), "utf8");
  const imageCount = result.lineups.reduce((total, lineup) => total + (lineup.images?.length ?? 0), 0);
  const withPreviewCount = result.lineups.filter((lineup) => Boolean(lineup.previewImageUrl)).length;

  console.log(`[export] saved to ${outputPath}`);

  console.log(
    JSON.stringify(
      {
        sourceUrl,
        mapCount: result.mapUrls.length,
        categoryCount: result.categoryUrls.length,
        lineupCount: result.lineups.length,
        imageCount,
        withPreviewCount,
        errorCount: result.errors.length,
        outputPath
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
