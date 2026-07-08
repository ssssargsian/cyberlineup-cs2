"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MapPin, MoveRight, PlayCircle } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/Badge";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { SourceBadge } from "@/components/SourceBadge";
import { UtilityTypeBadge } from "@/components/UtilityTypeBadge";
import { ImportedImage } from "@/src/components/ImportedImage";
import { formatAreaRu, formatLineupTitleRu, formatMapNameRu } from "@/src/lib/i18n/lineupDisplay";

type LineupCardProps = {
  lineup: {
    id: number;
    slug: string;
    title: string;
    utilityType: "smoke" | "flash" | "molotov" | "he" | "oneway" | "unknown";
    difficulty: "easy" | "medium" | "hard" | "unknown";
    area: string | null;
    fromPosition: string | null;
    targetPosition: string | null;
    isVerified: boolean;
    previewImageUrl: string | null;
    videoUrl?: string | null;
    sourceName: string | null;
    map: {
      name: string;
      slug: string;
    };
  };
};

export function LineupCard({ lineup }: LineupCardProps) {
  const displayTitle = formatLineupTitleRu(lineup.title);
  const displayMapName = formatMapNameRu(lineup.map.name, lineup.map.slug);

  return (
    <motion.div className="h-full" whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
      <Link href={`/lineups/${lineup.slug}`} className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 shadow-[0_20px_70px_rgba(0,0,0,0.3)] transition duration-200 hover:border-orange-400/35 hover:shadow-[0_24px_90px_rgba(255,85,0,0.14)]">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#05070d]">
          <ImportedImage
            src={lineup.previewImageUrl}
            alt={displayTitle}
            className="absolute inset-0"
            imgClassName="transition duration-500 group-hover:scale-[1.03]"
            fallbackLabel="Фото не добавлено"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070D]/84 via-[#05070D]/12 to-black/15" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <UtilityTypeBadge value={lineup.utilityType} />
            <DifficultyBadge value={lineup.difficulty} />
          </div>
          <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            {displayMapName}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-orange-200">CS2 раскид</div>
              <h3 className="line-clamp-2 text-xl font-black leading-tight text-white transition group-hover:text-orange-50">{displayTitle}</h3>
            </div>
            {lineup.isVerified ? <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-300" /> : null}
          </div>

          <div className="grid gap-3 text-sm text-slate-300">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
              <MapPin className="h-4 w-4 text-cyan-300" />
              {formatAreaRu(lineup.area)}
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-slate-300">
              <span className="truncate">{lineup.fromPosition ?? "Позиция не указана"}</span>
              <MoveRight className="h-4 w-4 shrink-0 text-orange-300" />
              <span className="truncate">{lineup.targetPosition ?? "Цель не указана"}</span>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap gap-2">
            <SourceBadge name={lineup.sourceName} />
            {lineup.isVerified ? <Badge className="border-emerald-400/25 bg-emerald-500/10 text-emerald-200">Проверено</Badge> : null}
            {lineup.videoUrl ? (
              <Badge className="border-cyan-400/25 bg-cyan-500/10 text-cyan-200">
                <PlayCircle className="mr-1 h-3 w-3" />
                Видео
              </Badge>
            ) : null}
          </div>

          <div className="mt-auto inline-flex items-center justify-between rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 py-3 text-sm font-black text-orange-100 transition group-hover:border-orange-300/45 group-hover:bg-orange-500/[0.16]">
            <span>Открыть</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
