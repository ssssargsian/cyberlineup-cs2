import { PrismaClient } from "@prisma/client";

import { safeLatinSlug, stableHash } from "../lib/utils";

const prisma = new PrismaClient();
const unsafeSlugPattern = /[^a-z0-9-]|--|^-|-$|[а-яё]/i;

function needsRepair(slug: string) {
  return unsafeSlugPattern.test(slug);
}

async function makeUniqueSlug(base: string, currentId: number) {
  let candidate = base;
  let attempt = 0;

  while (true) {
    const existing = await prisma.lineup.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing || existing.id === currentId) {
      return { slug: candidate, hadConflict: attempt > 0 };
    }

    attempt += 1;
    candidate = `${base}-${attempt + 1}`;
  }
}

async function main() {
  const lineups = await prisma.lineup.findMany({
    include: { map: true },
    orderBy: { id: "asc" }
  });

  let repaired = 0;
  let skipped = 0;
  let conflicts = 0;

  for (const lineup of lineups) {
    if (!needsRepair(lineup.slug)) {
      skipped += 1;
      continue;
    }

    const suffix = stableHash(lineup.sourceUrl ?? String(lineup.id));
    const base = safeLatinSlug(`${lineup.title} ${lineup.map.name}`, suffix);
    const unique = await makeUniqueSlug(base, lineup.id);

    if (unique.hadConflict) {
      conflicts += 1;
    }

    await prisma.lineup.update({
      where: { id: lineup.id },
      data: { slug: unique.slug }
    });

    repaired += 1;
    console.log(`[slugs] ${lineup.slug} -> ${unique.slug}`);
  }

  console.log(`[slugs] repaired: ${repaired}`);
  console.log(`[slugs] skipped: ${skipped}`);
  console.log(`[slugs] conflicts: ${conflicts}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
