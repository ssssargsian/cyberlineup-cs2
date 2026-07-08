import type { Difficulty, ImportJob, ImportSource, Lineup, LineupStatus, Map, Side, UtilityType } from "@prisma/client";
import type { LineupStep } from "@/src/lib/importers/types";

export type LineupWithMap = Lineup & { map: Map };
export type ImportedLineup = LineupWithMap & { sourceName: string | null; sourceUrl: string | null };
export type SerializedLineup = Omit<LineupWithMap, "steps"> & { steps: Array<string | LineupStep> };

export type SearchIntent = {
  map?: string;
  mapSlug?: string;
  mapName?: string;
  utilityType?: UtilityType;
  area?: string;
  side?: Side;
  difficulty?: Difficulty;
  verifiedOnly?: boolean;
};

export type AdminDashboardData = {
  maps: Map[];
  sources: ImportSource[];
  jobs: (ImportJob & { source: ImportSource })[];
  drafts: LineupWithMap[];
  publishedCount: number;
  pendingCount: number;
  lineups: LineupWithMap[];
};

export type LineupStatusValue = LineupStatus;
