import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin";

export async function POST() {
  const unauthorized = ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const { runEnabledImports } = await import("@/src/lib/importers/websiteImporter");
  const results = await runEnabledImports();
  return NextResponse.json({ ok: true, results });
}
