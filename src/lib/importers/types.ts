import type { Difficulty, ImportSource, Side, UtilityType } from "@prisma/client";

export type LineupStep = {
  title: string;
  text: string;
  imageUrl: string | null;
  sourceImageUrl?: string | null;
  localImageUrl?: string | null;
};

export type LineupImage = {
  url: string;
  sourceUrl: string;
  localUrl: string | null;
  alt: string;
  role: "preview" | "position" | "aim" | "step" | "gallery";
  stepIndex: number | null;
};

export type ExternalLineupCandidate = {
  title: string;
  slug: string;
  map: string;
  mapSlug?: string;
  utilityType: UtilityType;
  side: Side;
  area: string | null;
  fromPosition: string | null;
  targetPosition: string | null;
  difficulty: Difficulty;
  throwType: string | null;
  description: string | null;
  steps: LineupStep[] | null;
  images: LineupImage[] | null;
  videoUrl: string | null;
  previewImageUrl: string | null;
  aimImageUrl: string | null;
  positionImageUrl: string | null;
  tags: string[];
  aliases: string[];
  status: "draft" | "pending_review" | "published" | "rejected";
  isVerified: boolean;
  sourceName: string;
  sourceUrl: string;
  importedAt: string;
  rawTitle?: string | null;
  rawHtml?: string | null;
};

export type CrawlPage = {
  url: string;
  html: string;
};

export type CrawlRobotsPolicy = {
  checkedUrl: string;
  allowed: boolean;
  disallowRules: string[];
};

export type CrawlDiscovery = {
  sourceName: string;
  sourceUrl: string;
  robots: CrawlRobotsPolicy;
  mapUrls: string[];
  categoryUrls: string[];
  lineupUrls: string[];
  errors: string[];
};

export type ExportRaskidkiResult = CrawlDiscovery & {
  lineups: ExternalLineupCandidate[];
};

export type ImportResult = {
  sourceName: string;
  foundCount: number;
  importedCount: number;
  skippedCount: number;
  candidates: ExternalLineupCandidate[];
  errors: string[];
};

export type ImportToDatabaseResult = {
  foundCount: number;
  importedCount: number;
  skippedCount: number;
  createdCount: number;
  updatedCount: number;
  errors: string[];
};

export type ImportSourceAdapter = {
  name: string;
  canHandle: (source: Pick<ImportSource, "baseUrl" | "name" | "type">) => boolean;
  exportFromSource: (source: Pick<ImportSource, "baseUrl" | "name" | "type">) => Promise<ExportRaskidkiResult>;
};
