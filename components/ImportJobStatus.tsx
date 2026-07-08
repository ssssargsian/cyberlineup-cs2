import type { ImportJobStatus as ImportJobStatusValue } from "@prisma/client";

import { Badge } from "@/components/Badge";

const styles: Record<ImportJobStatusValue, string> = {
  pending: "border-white/10 bg-white/5 text-slate-300",
  running: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  completed: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  failed: "border-rose-400/30 bg-rose-500/10 text-rose-200"
};

export function ImportJobStatus({ value }: { value: ImportJobStatusValue }) {
  const labels: Record<ImportJobStatusValue, string> = {
    pending: "Ожидает",
    running: "В работе",
    completed: "Завершён",
    failed: "Ошибка"
  };

  return <Badge className={styles[value]}>{labels[value]}</Badge>;
}
