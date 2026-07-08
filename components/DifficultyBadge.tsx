import type { Difficulty } from "@prisma/client";

import { Badge } from "@/components/Badge";
import { formatDifficultyRu } from "@/src/lib/i18n/lineupDisplay";

const styles: Record<Difficulty, string> = {
  easy: "border-cyan-400/35 bg-cyan-500/12 text-cyan-200",
  medium: "border-blue-400/35 bg-blue-500/12 text-blue-200",
  hard: "border-rose-400/35 bg-rose-500/12 text-rose-200",
  unknown: "border-white/10 bg-white/5 text-slate-300"
};

export function DifficultyBadge({ value }: { value: Difficulty }) {
  return <Badge className={styles[value]}>{formatDifficultyRu(value)}</Badge>;
}
