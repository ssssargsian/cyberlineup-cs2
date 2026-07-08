import OpenAI from "openai";

import { searchLineups } from "@/src/lib/search";
import type { SearchIntent } from "@/src/lib/search";
import { formatDifficultyRu, formatLineupTitleRu, formatMapNameRu, formatUtilityTypeRu } from "@/src/lib/i18n/lineupDisplay";

const WEB_FALLBACK_SOURCE = "site:xn----7sbbane1abpc1b0aig0a.xn--p1ai/raskidki-granat-counter-strike-2/";

function formatIntent(intent: SearchIntent) {
  return {
    map: intent.mapName ?? intent.map,
    utilityType: intent.utilityType,
    area: intent.area,
    side: intent.side
  };
}

function buildNoResultsAnswer(query: string, intent: SearchIntent) {
  const hints = [intent.mapName ?? intent.map, intent.area, intent.utilityType].filter(Boolean).join(" • ");
  const webSearchUrl =
    process.env.ENABLE_WEB_FALLBACK === "true"
      ? `https://www.google.com/search?q=${encodeURIComponent(`${WEB_FALLBACK_SOURCE} ${query}`)}`
      : null;

  return {
    answer: webSearchUrl
      ? `В базе пока нет подходящих раскидов.${hints ? ` Попробуйте уточнить запрос: ${hints}.` : ""} Можно также проверить внешний поиск: ${webSearchUrl}`
      : `В базе пока нет подходящих раскидов.${hints ? ` Попробуйте уточнить запрос: ${hints}.` : ""}`,
    results: [],
    webSearchUrl
  };
}

function buildFallbackAnswer(query: string, results: Awaited<ReturnType<typeof searchLineups>>["results"]) {
  if (!results.length) {
    return {
      answer: "В базе пока нет подходящих раскидов.",
      results: []
    };
  }

  const grouped = results.slice(0, 6).reduce<Record<string, typeof results>>((accumulator, lineup) => {
    const key = lineup.utilityType;
    accumulator[key] ??= [];
    accumulator[key].push(lineup);
    return accumulator;
  }, {});

  const blocks = Object.entries(grouped).map(([utility, group]) => {
    const headline = `${formatUtilityTypeRu(utility)}: ${group.length}`;
    const lines = group.slice(0, 3).map((lineup) => {
      return `• ${formatLineupTitleRu(lineup.title)} — ${formatMapNameRu(lineup.map.name, lineup.map.slug)}, ${lineup.area ?? "зона не указана"}, ${lineup.fromPosition ?? "позиция не указана"} → ${lineup.targetPosition ?? "цель не указана"}, сложность: ${formatDifficultyRu(lineup.difficulty)} (/lineups/${lineup.slug})`;
    });

    return [headline, ...lines].join("\n");
  });

  return {
    answer: [`Нашёл ${results.length} раскидов по запросу «${query}».`, ...blocks].join("\n\n"),
    results
  };
}

export async function buildAssistantResponse(query: string) {
  const search = await searchLineups({ query });

  if (!search.results.length) {
    const fallback = buildNoResultsAnswer(query, search.intent);
    return {
      mode: "fallback" as const,
      answer: fallback.answer,
      intent: formatIntent(search.intent),
      results: [],
      webSearchUrl: fallback.webSearchUrl
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const fallback = buildFallbackAnswer(query, search.results);
    return {
      mode: "fallback" as const,
      answer: fallback.answer,
      intent: formatIntent(search.intent),
      results: search.results
    };
  }

  try {
    const client = new OpenAI({ apiKey });
    const compactResults = search.results.slice(0, 8).map((lineup) => ({
      title: lineup.title,
      displayTitle: formatLineupTitleRu(lineup.title),
      map: formatMapNameRu(lineup.map.name, lineup.map.slug),
      utilityType: formatUtilityTypeRu(lineup.utilityType),
      area: lineup.area,
      fromPosition: lineup.fromPosition,
      targetPosition: lineup.targetPosition,
      difficulty: formatDifficultyRu(lineup.difficulty),
      sourceUrl: lineup.sourceUrl,
      url: `/lineups/${lineup.slug}`
    }));

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "Ты ассистент CyberLineup по раскидам гранат CS2. Отвечай только на русском языке. Отвечай только на основе переданных данных из базы. Запрещено придумывать раскиды, позиции, карты, видео, шаги или советы, которых нет в данных. Если подходящих данных нет, скажи: \"В базе пока нет подходящих раскидов\". Для каждого найденного раскида укажи: название, карту, тип гранаты, откуда кидать, куда летит, сложность и ссылку на страницу."
        },
        {
          role: "user",
          content: `Запрос: ${query}\nIntent: ${JSON.stringify(formatIntent(search.intent))}\nLineups: ${JSON.stringify(compactResults)}\nСформируй короткий структурированный ответ на русском. Используй только эти lineups.`
        }
      ]
    });

    const answer = completion.choices[0]?.message?.content?.trim();

    return {
      mode: "openai" as const,
      answer: answer || buildFallbackAnswer(query, search.results).answer,
      intent: formatIntent(search.intent),
      results: search.results
    };
  } catch {
    const fallback = buildFallbackAnswer(query, search.results);
    return {
      mode: "fallback" as const,
      answer: fallback.answer,
      intent: formatIntent(search.intent),
      results: search.results
    };
  }
}
