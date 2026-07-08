import { SearchX } from "lucide-react";

import { ButtonLink } from "@/src/components/ui/Button";

export function UiEmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="tactical-panel flex flex-col items-center justify-center gap-4 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/25 bg-orange-500/10 text-orange-200">
        <SearchX className="h-7 w-7" />
      </div>
      <h3 className="text-2xl font-black text-white">{title}</h3>
      <p className="max-w-xl text-sm leading-7 text-slate-300">{description}</p>
      {actionHref && actionLabel ? (
        <ButtonLink href={actionHref} variant="primary" className="mt-2">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </div>
  );
}
