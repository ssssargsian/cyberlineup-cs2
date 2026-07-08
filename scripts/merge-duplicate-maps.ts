import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const canonicalMap = {
  name: "Dust 2",
  slug: "dust-2",
  description: "Классическая карта с быстрыми выходами, жёсткой борьбой за mid и сильной ролью смоков на B.",
  imageUrl: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=80"
};

async function ensureCanonicalMap() {
  const candidates = await prisma.map.findMany({
    where: {
      OR: [
        { slug: { in: ["dust-2", "dust-ii", "dust2"] } },
        { name: { in: ["Dust 2", "Dust II"] } }
      ]
    },
    orderBy: { id: "asc" }
  });

  const existingCanonical =
    candidates.find((map) => map.slug === canonicalMap.slug) ??
    candidates.find((map) => map.name === canonicalMap.name);

  if (existingCanonical) {
    return prisma.map.update({
      where: { id: existingCanonical.id },
      data: canonicalMap
    });
  }

  const firstDuplicate = candidates[0];

  if (firstDuplicate) {
    return prisma.map.update({
      where: { id: firstDuplicate.id },
      data: canonicalMap
    });
  }

  return prisma.map.create({ data: canonicalMap });
}

async function main() {
  const canonical = await ensureCanonicalMap();
  const duplicates = await prisma.map.findMany({
    where: {
      id: { not: canonical.id },
      OR: [
        { slug: { in: ["dust-ii", "dust2"] } },
        { name: { in: ["Dust II"] } }
      ]
    },
    orderBy: { id: "asc" }
  });

  let moved = 0;
  let deleted = 0;

  for (const duplicate of duplicates) {
    const moveResult = await prisma.lineup.updateMany({
      where: { mapId: duplicate.id },
      data: { mapId: canonical.id }
    });

    moved += moveResult.count;

    const remaining = await prisma.lineup.count({ where: { mapId: duplicate.id } });

    if (remaining === 0) {
      await prisma.map.delete({ where: { id: duplicate.id } });
      deleted += 1;
    }
  }

  console.log(`[maps] canonical: ${canonical.name} (${canonical.slug})`);
  console.log(`[maps] duplicate maps found: ${duplicates.length}`);
  console.log(`[maps] lineups moved: ${moved}`);
  console.log(`[maps] maps deleted: ${deleted}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
