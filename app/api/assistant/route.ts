import { NextResponse } from "next/server";

import { buildAssistantResponse } from "@/lib/assistant";

export async function POST(request: Request) {
  const body = (await request.json()) as { query?: string };
  const query = body.query?.trim() ?? "";

  if (!query) {
    return NextResponse.json({
      mode: "fallback",
      answer: "В базе пока нет подходящих раскидов.",
      intent: {},
      results: []
    });
  }

  return NextResponse.json(await buildAssistantResponse(query));
}
