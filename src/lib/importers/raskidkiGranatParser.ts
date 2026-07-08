import { UtilityType } from "@prisma/client";

import { toAbsoluteUrl } from "@/lib/utils";
import { normalizeLineup } from "@/src/lib/importers/normalizeLineup";
import type { CrawlPage, ExternalLineupCandidate, LineupImage, LineupStep } from "@/src/lib/importers/types";

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function extractMapFromUrl(url: string) {
  const match = url.match(/raskidki-granat-counter-strike-2\/([^/]+)\//i);
  return match?.[1] ?? null;
}

function extractTitleFromUrl(url: string) {
  const lastSegment = url.split("/").filter(Boolean).pop();
  return lastSegment?.replace(/\.html$/i, "").replace(/-/g, " ") ?? "";
}

function cleanupHeading(value: string) {
  return normalizeWhitespace(
    value
      .replace(/—\s*гайд cs2$/i, "")
      .replace(/\s*-\s*гайд cs2$/i, "")
      .replace(/\s*\/\s*раскидка гранат cs2$/i, "")
      .replace(/^раскидка гранат на карте\s+/i, "")
      .replace(/\s+для counter-strike 2$/i, "")
      .replace(/копия[-\s]*/gi, "")
  );
}

function inferUtilityTypeFromUrl(url: string) {
  const lower = url.toLowerCase();

  if (lower.includes("/smoke") || lower.includes("smoke-")) return UtilityType.smoke;
  if (lower.includes("/flash") || lower.includes("flash-")) return UtilityType.flash;
  if (lower.includes("/molotov") || lower.includes("molotov-")) return UtilityType.molotov;
  if (lower.includes("/hegrenade") || lower.includes("hegrenade-")) return UtilityType.he;
  if (lower.includes("/oneway") || lower.includes("oneway-")) return UtilityType.oneway;
  return UtilityType.unknown;
}

function pickUniqueDescription(candidates: Array<string | null | undefined>) {
  const ignoredPhrases = [
    "раскидки гранат в игре counter-strike 2 являются важной частью",
    "существуют различные типы гранат",
    "для освоения грамотных раскидок важно изучить карты",
    "я зарабатываю на размещении рекламы",
    "регистрируйся по моей партнерской ссылке",
    "learn to build and deploy fast",
    "профессиональный игрок в cs2"
  ];

  const picked = candidates
    .map((candidate) => normalizeWhitespace(candidate ?? ""))
    .filter(Boolean)
    .filter((candidate) => !ignoredPhrases.some((phrase) => candidate.toLowerCase().includes(phrase)));

  return picked[0] ?? null;
}

function extractVideoUrl($: any, pageUrl: string) {
  const selectors = [
    'main iframe[src*="youtube"]',
    '.granata-main iframe[src*="youtube"]',
    '.granata-main a[href*="youtube.com"]',
    '.granata-main a[href*="youtu.be"]',
    '.granata-main video source[src]'
  ];

  for (const selector of selectors) {
    const node = $(selector).first();
    const value = node.attr("src") ?? node.attr("href");

    if (value) {
      return toAbsoluteUrl(pageUrl, value);
    }
  }

  return null;
}

function extractStepText($: any, container: any) {
  const textBlocks = container
    .find("p, li")
    .map((_: unknown, element: unknown) => normalizeWhitespace($(element).text()))
    .get()
    .filter(Boolean);

  return textBlocks.join(" ").trim();
}

function pickImageCandidate($: any, element: any) {
  const node = $(element);
  const srcset = String(node.attr("srcset") ?? node.attr("data-srcset") ?? "")
    .split(",")
    .map((entry) => entry.trim().split(/\s+/)[0])
    .filter(Boolean)
    .pop();

  return (
    node.attr("src") ??
    node.attr("data-src") ??
    node.attr("data-original") ??
    node.attr("data-lazy-src") ??
    srcset ??
    null
  );
}

function isRelevantImage(url: string) {
  const lower = url.toLowerCase();

  if (!/\.(?:jpg|jpeg|png|webp|gif)(?:\?|$)/i.test(lower) && !lower.includes("phpthumbof")) {
    return false;
  }

  if (!lower.includes("/assets/resourceimages/") && !lower.includes("phpthumbof")) {
    return false;
  }

  return ![
    "favicon",
    "logo",
    "telegram",
    "tg",
    "donate",
    "vk.",
    "youtube",
    "social",
    "avatar",
    "banner",
    "counter"
  ].some((marker) => lower.includes(marker));
}

function collectImages($: any, pageUrl: string, title: string) {
  const images = new Map<string, LineupImage>();

  $('meta[property="og:image"], meta[name="og:image"]').each((_: unknown, element: unknown) => {
    const imageUrl = toAbsoluteUrl(pageUrl, $(element).attr("content"));

    if (imageUrl && isRelevantImage(imageUrl)) {
      images.set(imageUrl, {
        url: imageUrl,
        sourceUrl: imageUrl,
        localUrl: null,
        alt: title,
        role: "preview",
        stepIndex: null
      });
    }
  });

  $("main img, .granata-main img, .swiper-slide img, article img").each((_: unknown, element: unknown) => {
    const imageUrl = toAbsoluteUrl(pageUrl, pickImageCandidate($, element));

    if (!imageUrl || !isRelevantImage(imageUrl)) {
      return;
    }

    images.set(imageUrl, {
      url: imageUrl,
      sourceUrl: imageUrl,
      localUrl: null,
      alt: normalizeWhitespace($(element).attr("alt") ?? title),
      role: "gallery",
      stepIndex: null
    });
  });

  return Array.from(images.values());
}

function enrichStepImage(step: LineupStep, imageUrl: string | null): LineupStep {
  return {
    ...step,
    imageUrl,
    sourceImageUrl: imageUrl,
    localImageUrl: null
  };
}

export async function parseRaskidkiGranatLineupPage(page: CrawlPage, sourceName = "ГАЙД CS2"): Promise<ExternalLineupCandidate> {
  if (typeof globalThis.File === "undefined") {
    globalThis.File = class FilePolyfill {} as unknown as typeof File;
  }

  const cheerio = await import("cheerio");
  const $ = cheerio.load(page.html);
  const breadcrumbTitle = cleanupHeading($(".breadcrumb .breadcrumb-item").last().text());
  const headingTitle = cleanupHeading($("main h1, h1, main .breadcrumb-content h2 span, h2 span").first().text());
  const ogTitle = cleanupHeading($('meta[property="og:title"], meta[name="og:title"]').first().attr("content") ?? "");
  const documentTitle = cleanupHeading($("title").first().text());
  const headingHasUtility = /(smoke|flash|molotov|hegrenade|\bhe\b|oneway|one way|смок|флеш|молотов|ванвей)/i.test(headingTitle);
  const rawTitle = headingHasUtility
    ? headingTitle
    : breadcrumbTitle || headingTitle || ogTitle || documentTitle || extractTitleFromUrl(page.url);
  const mapLabel = $(".breadcrumb .breadcrumb-item").eq(2).text().trim() || extractMapFromUrl(page.url) || null;

  const steps: LineupStep[] = $(".swiper-slide .multiphoto-box")
    .map((_, element) => {
      const container = $(element);
      const title = normalizeWhitespace(container.find(".zagolovok-granata").first().text());
      const imageUrl = toAbsoluteUrl(page.url, pickImageCandidate($, container.find("img").first()));
      const text = extractStepText($, container) || title;

      if (!title && !imageUrl) {
        return null;
      }

      return enrichStepImage({
        title: title || "Шаг",
        text: text || title || "Без описания",
        imageUrl
      }, imageUrl) satisfies LineupStep;
    })
    .get()
    .filter(Boolean) as LineupStep[];

  const description = pickUniqueDescription([
    $(".description-granata").first().text(),
    $(".share").nextAll("p").slice(0, 6).text(),
    $(".granata-main p.description-granata").first().text()
  ]);

  const allImages = collectImages($, page.url, rawTitle);

  for (const [index, step] of steps.entries()) {
    if (!step.imageUrl) {
      continue;
    }

    const existing = allImages.find((image) => image.sourceUrl === step.imageUrl);
    if (existing) {
      existing.role = "step";
      existing.stepIndex = index;
      existing.alt = `${rawTitle} — ${step.title}`;
    }
  }

  const firstStepImage = steps.find((step) => step.imageUrl)?.imageUrl ?? null;
  const previewImageUrl = firstStepImage ?? allImages[0]?.url ?? toAbsoluteUrl(page.url, $('.granata-main img[src*="phpthumbof"]').first().attr("src"));
  const positionImageUrl = steps[0]?.imageUrl ?? null;
  const aimImageUrl =
    steps.find((step) => /прицел|наводим|aim|crosshair/i.test(`${step.title} ${step.text}`))?.imageUrl ??
    steps[1]?.imageUrl ??
    steps[0]?.imageUrl ??
    null;
  const videoUrl = extractVideoUrl($, page.url);

  return normalizeLineup({
    title: rawTitle,
    sourceUrl: page.url,
    sourceName,
    pageUrl: page.url,
    mapName: mapLabel,
    mapSlug: extractMapFromUrl(page.url),
    utilityType: inferUtilityTypeFromUrl(page.url),
    description,
    steps: steps.length ? steps : null,
    images: allImages.length ? allImages : null,
    videoUrl,
    previewImageUrl,
    aimImageUrl,
    positionImageUrl,
    importedAt: new Date(),
    rawHtml: null
  }) satisfies ExternalLineupCandidate;
}
