"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SEARCH_PLACEHOLDER } from "@/src/lib/catalog";
import { trackGoal } from "@/src/lib/analytics";
import { cn } from "@/lib/utils";

export function SearchBar({
  initialValue = "",
  actionPath = "/search",
  className,
  large = false,
  buttonLabel = "Найти",
  placeholder = SEARCH_PLACEHOLDER
}: {
  initialValue?: string;
  actionPath?: string;
  className?: string;
  large?: boolean;
  buttonLabel?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);

  return (
    <motion.form
      layout
      className={cn(
        "flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b0f18]/92 p-2.5 shadow-[0_14px_44px_rgba(0,0,0,0.24)] sm:flex-row sm:items-center",
        large ? "p-3" : "",
        className
      )}
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        const trimmedQuery = query.trim();

        trackGoal("search_submit", { query: trimmedQuery });

        if (trimmedQuery) {
          params.set("q", trimmedQuery);
        }
        router.push(params.toString() ? `${actionPath}?${params.toString()}` : actionPath);
      }}
    >
      <div className="flex h-[3.25rem] min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-[#05070d]/80 px-4 transition focus-within:border-orange-400/45 sm:h-14 sm:flex-1">
        <Search className="h-5 w-5 text-orange-300" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500 sm:text-base"
          placeholder={placeholder}
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-[3.25rem] shrink-0 items-center justify-center rounded-xl border border-orange-400/35 bg-[#ff5500] px-6 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(255,85,0,0.18)] transition hover:border-orange-300/55 hover:bg-[#f97316] sm:h-14"
      >
        {buttonLabel}
      </button>
    </motion.form>
  );
}
