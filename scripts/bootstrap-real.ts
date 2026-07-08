import { spawnSync } from "node:child_process";

import { LineupStatus, Prisma, PrismaClient, UtilityType } from "@prisma/client";

const prisma = new PrismaClient();
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function run(label: string, command: string, args: string[]) {
  console.log(`\n${label}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: {
      ...process.env,
      CI: "true"
    }
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? "unknown"}`);
  }
}

async function printSummary() {
  const [total, published, pending, rejected, demoHidden, importedPublished, withImages, unknownUtility] = await Promise.all([
    prisma.lineup.count(),
    prisma.lineup.count({ where: { status: LineupStatus.published } }),
    prisma.lineup.count({ where: { status: LineupStatus.pending_review } }),
    prisma.lineup.count({ where: { status: LineupStatus.rejected } }),
    prisma.lineup.count({
      where: {
        status: LineupStatus.rejected,
        OR: [
          { slug: { startsWith: "demo-" } },
          { sourceName: { contains: "Demo", mode: "insensitive" } },
          { tags: { has: "demo" } }
        ]
      }
    }),
    prisma.lineup.count({
      where: {
        status: LineupStatus.published,
        OR: [
          { sourceName: "ГАЙД CS2" },
          { sourceName: "ГАЙД CS2 / Раскидка гранат CS2" },
          { sourceUrl: { contains: "xn----7sbbane1abpc1b0aig0a.xn--p1ai" } }
        ]
      }
    }),
    prisma.lineup.count({ where: { OR: [{ previewImageUrl: { not: null } }, { images: { not: Prisma.JsonNull } }] } }),
    prisma.lineup.count({ where: { utilityType: UtilityType.unknown } })
  ]);

  console.log("\n[summary] Done");
  console.log(`[summary] total lineups: ${total}`);
  console.log(`[summary] published: ${published}`);
  console.log(`[summary] pending_review: ${pending}`);
  console.log(`[summary] rejected: ${rejected}`);
  console.log(`[summary] demo hidden: ${demoHidden}`);
  console.log(`[summary] imported published: ${importedPublished}`);
  console.log(`[summary] with images/preview: ${withImages}`);
  console.log(`[summary] unknown utilityType: ${unknownUtility}`);
  console.log(`[summary] open: ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}`);
}

async function main() {
  console.log("[bootstrap] Starting CyberLineup SR real data setup");
  run("[db] Starting PostgreSQL container", pnpm, ["db:up"]);
  run("[db] Waiting for database", pnpm, ["db:wait"]);
  run("[prisma] Generating client", pnpm, ["prisma", "generate"]);
  run("[prisma] Applying migrations", pnpm, ["prisma", "migrate", "dev"]);
  run("[seed] Running seed without public demo", pnpm, ["prisma", "db", "seed"]);
  run("[export] Exporting real RASKIDKI lineups", pnpm, ["export:raskidki"]);
  run("[audit] Checking imported JSON", pnpm, ["audit:raskidki"]);
  run("[import] Importing lineups to PostgreSQL", pnpm, ["import:raskidki"]);
  run("[maps] Merging duplicate maps", pnpm, ["repair:maps"]);
  run("[slugs] Repairing lineup slugs", pnpm, ["repair:lineup-slugs"]);
  run("[publish] Publishing imported lineups", pnpm, ["publish:imported"]);
  run("[demo] Hiding demo lineups", pnpm, ["hide:demo"]);
  run("[build] Running production build", pnpm, ["build"]);
  await printSummary();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
