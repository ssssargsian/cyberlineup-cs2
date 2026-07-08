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
        "flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b0f18]/95 p-3 shadow-[0_22px_80px_rgba(0,0,0,0.32)] ring-1 ring-orange-400/5 sm:flex-row sm:items-center",
        large ? "p-3 sm:p-4" : "",
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
      <div className="flex h-14 items-center gap-3 rounded-xl border border-white/10 bg-[#05070d]/80 px-4 transition focus-within:border-orange-400/45 sm:h-16 sm:flex-1">
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
        className="inline-flex h-14 items-center justify-center rounded-xl border border-orange-400/40 bg-gradient-to-r from-[#ff5500] via-[#f97316] to-[#f59e0b] px-6 text-sm font-black text-white shadow-[0_0_32px_rgba(255,85,0,0.24)] transition hover:border-orange-300/60 hover:shadow-[0_0_42px_rgba(255,85,0,0.36)] sm:h-16"
      >
        {buttonLabel}
      </button>
    </motion.form>
  );
}
