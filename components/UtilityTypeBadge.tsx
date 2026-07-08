import type { UtilityType } from "@prisma/client";

import { Badge } from "@/components/Badge";
import { formatUtilityTypeRu } from "@/src/lib/i18n/lineupDisplay";

const styles: Record<UtilityType, string> = {
  smoke: "border-cyan-300/35 bg-cyan-400/[0.12] text-cyan-100",
  flash: "border-yellow-300/35 bg-yellow-400/[0.14] text-yellow-100",
  molotov: "border-orange-300/40 bg-orange-500/[0.16] text-orange-100",
  he: "border-emerald-400/35 bg-emerald-500/[0.12] text-emerald-200",
  oneway: "border-violet-400/35 bg-violet-500/[0.12] text-violet-200",
  unknown: "border-slate-400/20 bg-slate-500/10 text-slate-300"
};

export function UtilityTypeBadge({ value }: { value: UtilityType }) {
  return <Badge className={styles[value]}>{formatUtilityTypeRu(value)}</Badge>;
}
