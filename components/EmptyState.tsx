import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="tactical-panel flex flex-col items-center justify-center gap-4 p-10 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/25 bg-orange-500/10 text-orange-200">
        <SearchX className="h-7 w-7" />
      </div>
      <h3 className="relative text-2xl font-black text-white">{title}</h3>
      <p className="relative max-w-xl text-sm leading-7 text-slate-300">{description}</p>
      {action ? <div className="relative mt-2">{action}</div> : null}
    </div>
  );
}
