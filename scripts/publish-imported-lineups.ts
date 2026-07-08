import { LineupStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.lineup.updateMany({
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
    data: { status: LineupStatus.published }
  });

  console.log(`[publish] published imported lineups: ${result.count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
