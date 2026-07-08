import { Difficulty, Side, UtilityType } from "@prisma/client";
import OpenAI from "openai";
import { z } from "zod";

import type { ExternalLineupCandidate } from "@/src/lib/importers/types";

const searchIntentSchema = z.object({
  normalizedQuery: z.string(),
  utilityType: z.nativeEnum(UtilityType).optional(),
  side: z.nativeEnum(Side).optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  area: z.string().optional()
});

const importedCandidateSchema = z.object({
  mapSlug: z.string().optional(),
  utilityType: z.nativeEnum(UtilityType).optional(),
  side: z.nativeEnum(Side).optional(),
  area: z.string().optional(),
  fromPosition: z.string().nullable().optional(),
  targetPosition: z.string().nullable().optional(),
  description: z.string().nullable().optional()
});

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  return apiKey ? new OpenAI({ apiKey }) : null;
}

export async function normalizeSearchQueryWithAI(rawQuery: string, normalizedQuery: string) {
  const client = getClient();

  if (!client) {
    return null;
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Ты помогаешь нормализовать поисковые запросы по CS2. Нельзя придумывать новые данные. Используй только слова из запроса и очевидные канонические формы."
        },
        {
          role: "user",
          content: JSON.stringify({ rawQuery, normalizedQuery })
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    return content ? searchIntentSchema.parse(JSON.parse(content)) : null;
  } catch {
    return null;
  }
}

export async function classifyImportedCandidateWithAI(candidate: ExternalLineupCandidate) {
  const client = getClient();

  if (!client) {
    return null;
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Ты помогаешь структурировать импортированный текст о CS2 lineups. Нельзя додумывать. Если поле не видно из текста, оставляй его пустым."
        },
        {
          role: "user",
          content: JSON.stringify(candidate)
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    return content ? importedCandidateSchema.parse(JSON.parse(content)) : null;
  } catch {
    return null;
  }
}
