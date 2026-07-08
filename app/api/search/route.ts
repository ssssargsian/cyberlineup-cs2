import { NextResponse } from "next/server";

import { searchLineups } from "@/src/lib/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = await searchLineups({
    query: searchParams.get("q") ?? "",
    mapSlug: searchParams.get("mapSlug") ?? undefined,
    utilityType: (searchParams.get("utilityType") as any) ?? undefined,
    area: searchParams.get("area") ?? undefined,
    side: (searchParams.get("side") as any) ?? undefined,
    difficulty: (searchParams.get("difficulty") as any) ?? undefined,
    verifiedOnly: searchParams.get("verifiedOnly") === "true"
  });

  return NextResponse.json(search);
}
