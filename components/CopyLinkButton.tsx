"use client";

import { Copy, CopyCheck } from "lucide-react";
import { useState } from "react";

import { trackGoal } from "@/src/lib/analytics";

export function CopyLinkButton({ url, lineupSlug }: { url: string; lineupSlug?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        trackGoal("share_click", { lineupSlug });
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-400/15"
    >
      {copied ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Скопировано" : "Скопировать ссылку"}
    </button>
  );
}
