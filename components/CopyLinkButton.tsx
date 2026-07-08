"use client";

import { Copy, CopyCheck } from "lucide-react";
import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-400/25 hover:bg-cyan-400/10"
    >
      {copied ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Скопировано" : "Скопировать ссылку"}
    </button>
  );
}
