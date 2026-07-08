import { Bot, Crosshair, MapPinned, Radar, Shield } from "lucide-react";

import { Badge } from "@/components/Badge";
import { formatAreaRu, formatDifficultyRu, formatSideRu, formatUtilityTypeRu } from "@/src/lib/i18n/lineupDisplay";
import type { SearchIntent } from "@/src/lib/search";

const items = [
  { key: "mapName", label: "Карта", icon: MapPinned },
  { key: "utilityType", label: "Тип гранаты", icon: Bot },
  { key: "area", label: "Зона", icon: Crosshair },
  { key: "side", label: "Сторона", icon: Shield },
  { key: "difficulty", label: "Сложность", icon: Radar }
] as const;

function formatIntentValue(key: (typeof items)[number]["key"], value: unknown) {
  if (!value) return null;
  if (key === "utilityType") return formatUtilityTypeRu(String(value));
  if (key === "side") return formatSideRu(String(value));
  if (key === "difficulty") return formatDifficultyRu(String(value));
  if (key === "area") return formatAreaRu(String(value));
  return String(value);
}

export function SearchIntentPreview({ intent }: { intent: SearchIntent }) {
  return (
    <div className="glass-card flex flex-wrap gap-3 p-4">
      {items.map((item) => {
        const Icon = item.icon;
        const value = intent[item.key];
        const label = formatIntentValue(item.key, value);

        return (
          <div key={item.key} className="min-w-[10rem] flex-1 rounded-2xl border border-white/8 bg-white/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </div>
            {label ? <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">{label}</Badge> : <span className="text-sm text-slate-500">Не определено</span>}
          </div>
        );
      })}
    </div>
  );
}
