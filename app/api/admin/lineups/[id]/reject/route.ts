import { LineupStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const unauthorized = ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const lineup = await prisma.lineup.update({
    where: { id: Number(params.id) },
    data: { status: LineupStatus.rejected }
  });

  return NextResponse.json({ ok: true, lineup });
}
