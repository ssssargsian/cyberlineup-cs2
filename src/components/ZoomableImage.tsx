"use client";

import { Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";

import { ImportedImage } from "@/src/components/ImportedImage";
import { cn } from "@/lib/utils";

export function ZoomableImage({
  src,
  alt,
  className,
  imgClassName,
  priority: _priority,
  sizes: _sizes,
  caption,
  fallbackLabel = "Фото не удалось загрузить"
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  caption?: string;
  fallbackLabel?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const canZoom = Boolean(src);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function openLightbox() {
    if (!canZoom) {
      return;
    }

    setScale(1);
    setIsOpen(true);
  }

  return (
    <>
      <button
        type="button"
        disabled={!canZoom}
        onClick={openLightbox}
        className={cn("group relative block overflow-hidden text-left disabled:cursor-default", className)}
      >
        <ImportedImage
          src={src}
          alt={alt}
          fallbackLabel={fallbackLabel}
          className="absolute inset-0 h-full w-full"
          imgClassName={cn("transition duration-500 group-hover:scale-[1.02]", imgClassName)}
        />
        {canZoom ? (
          <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <Maximize2 className="h-3.5 w-3.5 text-cyan-200" />
            {caption ?? "Нажмите, чтобы увеличить"}
          </span>
        ) : null}
      </button>

      {isOpen && src ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/88 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="absolute right-3 top-3 flex gap-2 sm:right-6 sm:top-6">
            <button
              type="button"
              aria-label="Уменьшить"
              onClick={() => setScale((value) => Math.max(0.6, Number((value - 0.2).toFixed(1))))}
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white transition hover:border-cyan-300/30 sm:flex"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Увеличить"
              onClick={() => setScale((value) => Math.min(2.4, Number((value + 0.2).toFixed(1))))}
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white transition hover:border-cyan-300/30 sm:flex"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Сбросить масштаб"
              onClick={() => setScale(1)}
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white transition hover:border-cyan-300/30 sm:flex"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Закрыть"
              onClick={() => setIsOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white transition hover:border-orange-300/40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[86vh] max-w-[94vw] overflow-auto rounded-2xl border border-white/10 bg-[#05070d] p-2 shadow-[0_30px_120px_rgba(0,0,0,0.7)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="block max-h-[82vh] max-w-none rounded-xl object-contain transition-transform duration-200"
              style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
