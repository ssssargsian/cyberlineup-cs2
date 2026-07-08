import { PrismaClient } from "@prisma/client";

const maxAttempts = Number(process.env.DB_WAIT_ATTEMPTS ?? 60);
const delayMs = Number(process.env.DB_WAIT_DELAY_MS ?? 1000);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const prisma = new PrismaClient();

    try {
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      console.log(`[db] PostgreSQL is ready after ${attempt} attempt(s)`);
      return;
    } catch (error) {
      await prisma.$disconnect().catch(() => undefined);
      const message = error instanceof Error ? error.message : String(error);
      console.log(`[db] Waiting for PostgreSQL (${attempt}/${maxAttempts}): ${message}`);
      await sleep(delayMs);
    }
  }

  throw new Error(`[db] PostgreSQL did not become ready after ${maxAttempts} attempts`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
