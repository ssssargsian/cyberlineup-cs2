import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const unauthorized = ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const jobs = await prisma.importJob.findMany({
    include: { source: true },
    orderBy: { createdAt: "desc" },
    take: 25
  });

  return NextResponse.json(jobs);
}
