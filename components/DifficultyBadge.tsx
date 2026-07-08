import type { Difficulty } from "@prisma/client";

import { Badge } from "@/components/Badge";
import { formatDifficultyRu } from "@/src/lib/i18n/lineupDisplay";

const styles: Record<Difficulty, string> = {
  easy: "border-cyan-400/35 bg-cyan-500/[0.12] text-cyan-200",
  medium: "border-orange-400/35 bg-orange-500/[0.12] text-orange-100",
  hard: "border-red-400/35 bg-red-500/[0.12] text-red-100",
  unknown: "border-slate-400/20 bg-slate-500/10 text-slate-300"
};

export function DifficultyBadge({ value }: { value: Difficulty }) {
  return <Badge className={styles[value]}>{formatDifficultyRu(value)}</Badge>;
}
