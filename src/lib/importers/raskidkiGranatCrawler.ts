import { parseRaskidkiGranatLineupPage } from "@/src/lib/importers/raskidkiGranatParser";
import type { CrawlDiscovery, CrawlPage, CrawlRobotsPolicy, ExportRaskidkiResult, ExternalLineupCandidate } from "@/src/lib/importers/types";

const DEFAULT_SOURCE_URL = process.env.RASKIDKI_SOURCE_URL?.trim() || "https://xn----7sbbane1abpc1b0aig0a.xn--p1ai/raskidki-granat-counter-strike-2/";
const SOURCE_NAME = "ГАЙД CS2";
const MAP_SEGMENTS = new Set(["inferno", "office", "dust-2", "mirage", "ancient", "vertigo", "train", "nuke", "overpass", "anubis"]);
const CATEGORY_MARKERS = ["smoke", "smoki", "flash", "molotov", "hegrenade", "oneway", "one-way", "insta-smoke", "insta-smoki", "he"];
const EXCLUDED_MARKERS = ["kontakty", "contact", "favorite", "cart", "telegram", "donate", "auth", "admin", "login", "register", "manager"];
const MIN_DELAY_MS = 800;
const MAX_DELAY_MS = 1500;
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 20_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(minMs = MIN_DELAY_MS, maxMs = MAX_DELAY_MS) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

function absoluteUrl(baseUrl: string, href: string | null | undefined) {
  if (!href) {
    return null;
  }

  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    const normalized = parsed.toString();
    return normalized.endsWith(".html") ? normalized : normalized.replace(/\/+$/, "/");
  } catch {
    return url.replace(/[?#].*$/, "").replace(/\/+$/, "/");
  }
}

function isInsideSource(url: string, sourceUrl: string) {
  const source = new URL(sourceUrl);
  const parsed = new URL(url);

  return parsed.origin === source.origin && parsed.pathname.startsWith(source.pathname) && !parsed.search;
}

function isExcludedUrl(url: string) {
  const lower = url.toLowerCase();
  return EXCLUDED_MARKERS.some((marker) => lower.includes(marker)) || lower.includes("?");
}

function isMapUrl(url: string) {
  return /\/raskidki-granat-counter-strike-2\/[^/]+\/$/i.test(url);
}

function isCategoryUrl(url: string) {
  const lower = url.toLowerCase();
  return /\/raskidki-granat-counter-strike-2\/[^/]+\/(?:[^/]+\/?|[^/]+\.html)$/i.test(url) && !isMapUrl(url) && CATEGORY_MARKERS.some((marker) => lower.includes(marker));
}

function isLineupUrl(url: string) {
  const pathname = new URL(url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const filename = segments.at(-1)?.toLowerCase() ?? "";
  const categoryOnly = ["smoke.html", "smoki.html", "flash.html", "molotov.html", "hegrenade.html", "he.html", "oneway.html", "insta-smoke.html", "insta-smoki.html"].includes(filename);
  return /\/raskidki-granat-counter-strike-2\/[^/]+\/.+\.html$/i.test(url) && segments.length >= 4 && !categoryOnly && !isExcludedUrl(url);
}

async function fetchText(url: string, attempt = 0): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CyberLineupSRBot/1.0 (+https://localhost)",
        Accept: "text/html,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8"
      },
      signal: controller.signal,
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      await sleep(randomDelay());
      return fetchText(url, attempt + 1);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseRobots(robotsText: string, rootPath: string): CrawlRobotsPolicy {
  const lines = robotsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const disallowRules: string[] = [];
  let appliesToAllAgents = false;

  for (const line of lines) {
    const [rawKey, ...rawValue] = line.split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rawValue.join(":").trim();

    if (key === "user-agent") {
      appliesToAllAgents = value === "*";
      continue;
    }

    if (appliesToAllAgents && key === "disallow" && value) {
      disallowRules.push(value);
    }
  }

  const path = new URL(rootPath).pathname;
  const blocked = disallowRules.some((rule) => {
    if (rule === "/") {
      return true;
    }

    if (rule.includes("*?")) {
      return path.includes("?");
    }

    return path.startsWith(rule);
  });

  return {
    checkedUrl: new URL("/robots.txt", rootPath).toString(),
    allowed: !blocked,
    disallowRules
  };
}

async function runTasksWithConcurrency<T>(tasks: Array<() => Promise<T>>, concurrency: number) {
  const results: T[] = [];
  let cursor = 0;

  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (cursor < tasks.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await tasks[currentIndex]();
    }
  });

  await Promise.all(workers);
  return results;
}

async function parseHtml(html: string) {
  if (typeof globalThis.File === "undefined") {
    globalThis.File = class FilePolyfill {} as unknown as typeof File;
  }

  const cheerio = await import("cheerio");
  return cheerio.load(html);
}

async function discoverMapUrls(rootUrl: string, errors: string[]) {
  const rootHtml = await fetchText(rootUrl);
  const $ = await parseHtml(rootHtml);

  const mapUrls = $("a")
    .map((_, element) => normalizeUrl(absoluteUrl(rootUrl, $(element).attr("href")) ?? ""))
    .get()
    .filter(Boolean)
    .filter((url) => isInsideSource(url, rootUrl) && isMapUrl(url) && MAP_SEGMENTS.has(url.split("/").filter(Boolean).slice(-1)[0] ?? ""));

  if (!mapUrls.length) {
    errors.push("Map URLs were not discovered from the root catalog page.");
  }

  return Array.from(new Set(mapUrls));
}

async function discoverCategoryUrls(mapUrls: string[], errors: string[]) {
  const discovered = new Set<string>();

  const tasks = mapUrls.map((mapUrl) => async () => {
    await sleep(randomDelay());
    const html = await fetchText(mapUrl);
    const $ = await parseHtml(html);

    $("a").each((_, element) => {
      const href = normalizeUrl(absoluteUrl(mapUrl, $(element).attr("href")) ?? "");

      if (!href || !href.startsWith(mapUrl) || !isCategoryUrl(href)) {
        return;
      }

      discovered.add(href);
    });
  });

  try {
    await runTasksWithConcurrency(tasks, 3);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  return Array.from(discovered);
}

function parseSitemapUrls(xml: string) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => normalizeUrl(match[1]));
}

async function fetchSitemapUrls(rootUrl: string, errors: string[]) {
  const discovered = new Set<string>();
  const sitemapRoots = [new URL("/sitemap.xml", rootUrl).toString(), new URL("/sitemap_index.xml", rootUrl).toString()];

  try {
    for (const sitemapUrl of sitemapRoots) {
      try {
        const xml = await fetchText(sitemapUrl);
        const urls = parseSitemapUrls(xml);
        const nestedSitemaps = urls.filter((url) => /sitemap.*\.xml$/i.test(url));

        for (const nestedUrl of nestedSitemaps) {
          try {
            const nestedXml = await fetchText(nestedUrl);
            parseSitemapUrls(nestedXml).forEach((url) => discovered.add(url));
          } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error));
          }
        }

        urls.forEach((url) => discovered.add(url));
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    return Array.from(discovered).filter((url) => isInsideSource(url, rootUrl) && !isExcludedUrl(url));
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return [];
  }
}

async function discoverLineupUrls(categoryUrls: string[], sitemapUrls: string[], errors: string[]) {
  const discovered = new Set(
    sitemapUrls.filter((url) => isLineupUrl(url) && /(?:smoke|flash|molotov|hegrenade|oneway|reveal|ot-|от-)/i.test(url))
  );

  const tasks = categoryUrls.map((categoryUrl) => async () => {
    await sleep(randomDelay());
    const html = await fetchText(categoryUrl);
    const $ = await parseHtml(html);

    $("a").each((_, element) => {
      const href = normalizeUrl(absoluteUrl(categoryUrl, $(element).attr("href")) ?? "");

      if (!href || !href.startsWith(categoryUrl.replace(/[^/]+\.html$/i, "")) || !isLineupUrl(href)) {
        return;
      }

      discovered.add(href);
    });
  });

  try {
    await runTasksWithConcurrency(tasks, 3);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  return Array.from(discovered);
}

async function discoverRecursiveUrls(rootUrl: string, errors: string[]) {
  const visited = new Set<string>();
  const queued = new Set<string>([normalizeUrl(rootUrl)]);
  const categoryUrls = new Set<string>();
  const lineupUrls = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [{ url: normalizeUrl(rootUrl), depth: 0 }];
  const maxDepth = 5;

  while (queue.length) {
    const batch = queue.splice(0, 3).filter((item) => !visited.has(item.url));

    await runTasksWithConcurrency(
      batch.map((item) => async () => {
        visited.add(item.url);
        await sleep(randomDelay());

        try {
          const html = await fetchText(item.url);
          const $ = await parseHtml(html);

          $("a").each((_, element) => {
            const href = normalizeUrl(absoluteUrl(item.url, $(element).attr("href")) ?? "");

            if (!href || queued.has(href) || !isInsideSource(href, rootUrl) || isExcludedUrl(href)) {
              return;
            }

            if (isCategoryUrl(href)) {
              categoryUrls.add(href);
            }

            if (isLineupUrl(href)) {
              lineupUrls.add(href);
            }

            if (item.depth < maxDepth && (isMapUrl(href) || isCategoryUrl(href) || isLineupUrl(href))) {
              queued.add(href);
              queue.push({ url: href, depth: item.depth + 1 });
            }
          });
        } catch (error) {
          errors.push(error instanceof Error ? error.message : String(error));
        }
      }),
      3
    );
  }

  return {
    categoryUrls: Array.from(categoryUrls),
    lineupUrls: Array.from(lineupUrls),
    visitedCount: visited.size
  };
}

function isExternalLineupCandidate(value: ExternalLineupCandidate | null): value is ExternalLineupCandidate {
  return value !== null;
}

async function fetchLineupPages(urls: string[], errors: string[]) {
  let completed = 0;
  const tasks = urls.map((url) => async () => {
    await sleep(randomDelay());

    try {
      const page = {
        url,
        html: await fetchText(url)
      } satisfies CrawlPage;
      completed += 1;

      if (completed % 50 === 0 || completed === urls.length) {
        console.log(`[parse] fetched pages: ${completed}/${urls.length}`);
      }

      return page;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      completed += 1;

      if (completed % 50 === 0 || completed === urls.length) {
        console.log(`[parse] fetched pages: ${completed}/${urls.length}`);
      }

      return null;
    }
  });

  const pages = await runTasksWithConcurrency(tasks, 3);
  return pages.filter(Boolean) as CrawlPage[];
}

export async function crawlRaskidkiGranatSource(sourceUrl = DEFAULT_SOURCE_URL) {
  const errors: string[] = [];
  const robotsText = await fetchText(new URL("/robots.txt", sourceUrl).toString());
  const robots = parseRobots(robotsText, sourceUrl);

  if (!robots.allowed) {
    throw new Error(`Crawling ${sourceUrl} is blocked by robots.txt`);
  }

  const mapUrls = await discoverMapUrls(sourceUrl, errors);
  const categoryUrls = await discoverCategoryUrls(mapUrls, errors);
  const sitemapUrls = await fetchSitemapUrls(sourceUrl, errors);
  const recursive = await discoverRecursiveUrls(sourceUrl, errors);
  const allCategoryUrls = Array.from(new Set([...categoryUrls, ...recursive.categoryUrls]));
  const lineupUrls = Array.from(new Set([...(await discoverLineupUrls(allCategoryUrls, sitemapUrls, errors)), ...recursive.lineupUrls]));

  console.log(`[discover] sitemap urls: ${sitemapUrls.length}`);
  console.log(`[discover] html urls: ${recursive.visitedCount}`);
  console.log(`[discover] recursive urls: ${recursive.lineupUrls.length}`);
  console.log(`[discover] category urls: ${allCategoryUrls.length}`);
  console.log(`[discover] lineup candidate urls: ${lineupUrls.length}`);

  return {
    sourceName: SOURCE_NAME,
    sourceUrl,
    robots,
    mapUrls,
    categoryUrls: allCategoryUrls,
    lineupUrls,
    errors
  } satisfies CrawlDiscovery;
}

export async function exportRaskidkiGranatSource(sourceUrl = DEFAULT_SOURCE_URL) {
  const discovery = await crawlRaskidkiGranatSource(sourceUrl);
  const errors = [...discovery.errors];
  const pages = await fetchLineupPages(discovery.lineupUrls, errors);

  let parsedCount = 0;
  const parsed: Array<ExternalLineupCandidate | null> = await Promise.all(
    pages.map(async (page) => {
      try {
        const lineup = await parseRaskidkiGranatLineupPage(page, SOURCE_NAME);
        parsedCount += 1;

        if (parsedCount % 100 === 0 || parsedCount === pages.length) {
          console.log(`[parse] parsed pages: ${parsedCount}/${pages.length}`);
        }

        return lineup;
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
        parsedCount += 1;

        if (parsedCount % 100 === 0 || parsedCount === pages.length) {
          console.log(`[parse] parsed pages: ${parsedCount}/${pages.length}`);
        }

        return null;
      }
    })
  );

  const lineups = parsed.filter(isExternalLineupCandidate);
  const imageCount = lineups.reduce((total, lineup) => total + (lineup.images?.length ?? 0), 0);
  const failedCount = parsed.length - lineups.length;

  console.log(`[parse] parsed: ${lineups.length}`);
  console.log(`[parse] failed: ${failedCount}`);
  console.log(`[images] found: ${imageCount}`);

  return {
    ...discovery,
    errors,
    lineups
  } satisfies ExportRaskidkiResult;
}
