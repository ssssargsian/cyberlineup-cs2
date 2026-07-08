import { LineupStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.lineup.updateMany({
    where: {
      OR: [
        { slug: { startsWith: "demo-" } },
        { sourceName: { contains: "Demo", mode: "insensitive" } },
        { tags: { has: "demo" } }
      ]
    },
    data: { status: LineupStatus.rejected }
  });

  console.log(`[demo] hidden demo lineups: ${result.count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
