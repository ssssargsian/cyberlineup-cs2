import type { UtilityType } from "@prisma/client";

import { Badge } from "@/components/Badge";
import { formatUtilityTypeRu } from "@/src/lib/i18n/lineupDisplay";

const styles: Record<UtilityType, string> = {
  smoke: "border-slate-400/30 bg-slate-400/10 text-slate-200",
  flash: "border-yellow-400/35 bg-yellow-400/12 text-yellow-200",
  molotov: "border-orange-400/35 bg-orange-500/12 text-orange-200",
  he: "border-emerald-400/35 bg-emerald-500/12 text-emerald-200",
  oneway: "border-violet-400/35 bg-violet-500/12 text-violet-200",
  unknown: "border-white/10 bg-white/5 text-slate-300"
};

export function UtilityTypeBadge({ value }: { value: UtilityType }) {
  return <Badge className={styles[value]}>{formatUtilityTypeRu(value)}</Badge>;
}
