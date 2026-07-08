import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type SearchParamValue = string | string[] | number | undefined;

function firstValue(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0];
  }

  if (typeof value === "number") {
    return String(value);
  }

  return value;
}

function makeHref(basePath: string, searchParams: Record<string, SearchParamValue>, updates: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    const normalized = firstValue(value);
    if (normalized && key !== "error") {
      params.set(key, normalized);
    }
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function pageItems(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  for (let page = 2; page <= Math.min(3, totalPages); page += 1) {
    pages.add(page);
  }

  for (let page = Math.max(1, totalPages - 2); page <= totalPages; page += 1) {
    pages.add(page);
  }

  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  return sorted.reduce<Array<number | "ellipsis">>((accumulator, page) => {
    const previous = accumulator[accumulator.length - 1];
    if (typeof previous === "number" && page - previous > 1) {
      accumulator.push("ellipsis");
    }
    accumulator.push(page);
    return accumulator;
  }, []);
}

export function AdminPagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: Record<string, SearchParamValue>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/90 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-slate-400">
          Показано <span className="font-semibold text-white">{from}-{to}</span> из <span className="font-semibold text-white">{total}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-[0.18em] text-slate-500">На странице</span>
          {[25, 50, 100].map((size) => (
            <Link
              key={size}
              href={makeHref(basePath, searchParams, { page: 1, pageSize: size })}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                size === pageSize
                  ? "border-orange-400/45 bg-orange-500/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/30 hover:text-white"
              )}
            >
              {size}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          aria-disabled={isFirst}
          href={isFirst ? makeHref(basePath, searchParams, { page: currentPage }) : makeHref(basePath, searchParams, { page: currentPage - 1 })}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
            isFirst ? "pointer-events-none border-white/8 text-slate-600" : "border-white/10 text-slate-200 hover:border-cyan-400/30"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Назад
        </Link>

        {pageItems(currentPage, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-slate-500">
              ...
            </span>
          ) : (
            <Link
              key={item}
              href={makeHref(basePath, searchParams, { page: item })}
              className={cn(
                "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition",
                item === currentPage
                  ? "border-orange-400/45 bg-orange-500/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/30 hover:text-white"
              )}
            >
              {item}
            </Link>
          )
        )}

        <Link
          aria-disabled={isLast}
          href={isLast ? makeHref(basePath, searchParams, { page: currentPage }) : makeHref(basePath, searchParams, { page: currentPage + 1 })}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
            isLast ? "pointer-events-none border-white/8 text-slate-600" : "border-white/10 text-slate-200 hover:border-cyan-400/30"
          )}
        >
          Вперёд
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
