"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SEARCH_PLACEHOLDER } from "@/src/lib/catalog";
import { cn } from "@/lib/utils";

export function SearchBar({
  initialValue = "",
  actionPath = "/search",
  className,
  large = false,
  buttonLabel = "Найти"
}: {
  initialValue?: string;
  actionPath?: string;
  className?: string;
  large?: boolean;
  buttonLabel?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);

  return (
    <motion.form
      layout
      className={cn(
        "glass-card flex w-full flex-col gap-3 p-3 sm:flex-row sm:items-center",
        large ? "rounded-[2rem] p-4 sm:p-5" : "rounded-3xl",
        className
      )}
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (query.trim()) {
          params.set("q", query.trim());
        }
        router.push(params.toString() ? `${actionPath}?${params.toString()}` : actionPath);
      }}
    >
      <div className="flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 sm:h-16 sm:flex-1">
        <Search className="h-5 w-5 text-cyan-300" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500 sm:text-base"
          placeholder={SEARCH_PLACEHOLDER}
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:opacity-90 sm:h-16"
      >
        {buttonLabel}
      </button>
    </motion.form>
  );
}
