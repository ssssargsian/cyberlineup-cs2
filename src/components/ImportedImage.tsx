"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function ImportedImage({
  src,
  alt,
  className,
  imgClassName,
  fallbackLabel = "Нет фото"
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackLabel?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const hasPositionClass = /\b(absolute|relative|fixed|sticky)\b/.test(className ?? "");

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex min-h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.18),transparent_34%),linear-gradient(135deg,#05070d,#0b1020)] text-slate-400",
          className
        )}
      >
        <ImageOff className="h-8 w-8 text-cyan-200" />
        <span className="text-xs uppercase tracking-[0.2em]">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <div className={cn(!hasPositionClass && "relative", "overflow-hidden bg-slate-950/70", className)}>
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(15,23,42,0.92),rgba(34,211,238,0.12),rgba(15,23,42,0.92))]" />
      ) : null}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn("absolute inset-0 block h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}
