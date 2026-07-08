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
    <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.28)] sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        const value = intent[item.key];
        const label = formatIntentValue(item.key, value);

        return (
          <div
            key={item.key}
            className={[
              "rounded-2xl border p-4 transition",
              label ? "border-cyan-300/25 bg-cyan-400/[0.07]" : "border-white/8 bg-white/[0.03]"
            ].join(" ")}
          >
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </div>
            {label ? <Badge className="border-cyan-300/25 bg-cyan-400/10 text-cyan-100">{label}</Badge> : <span className="text-sm text-slate-500">Не определено</span>}
          </div>
        );
      })}
    </div>
  );
}
