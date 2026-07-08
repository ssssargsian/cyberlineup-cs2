import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card flex flex-col items-center justify-center gap-3 rounded-[2rem] p-10 text-center">
      <SearchX className="h-10 w-10 text-slate-500" />
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="max-w-xl text-sm leading-7 text-slate-400">{description}</p>
    </div>
  );
}
