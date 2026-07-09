"use client";

import { ExternalLink, PlayCircle, Video } from "lucide-react";
import { useState } from "react";

import { trackGoal } from "@/src/lib/analytics";

function toEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
    }

    if (parsed.hostname.includes("player.vimeo.com")) {
      return url;
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(?:$|\?)/i.test(url);
}

export function LineupVideo({
  videoUrl,
  externalVideoUrl,
  posterUrl,
  sourceUrl,
  sourceName,
  credit,
  title = "Видео раскидки",
  lineupSlug,
  map,
  utilityType
}: {
  videoUrl?: string | null;
  externalVideoUrl?: string | null;
  posterUrl?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  credit?: string | null;
  title?: string;
  lineupSlug?: string;
  map?: string;
  utilityType?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = externalVideoUrl ?? videoUrl ?? null;
  const isExternal = Boolean(externalVideoUrl);
  const embedUrl = url ? toEmbedUrl(url) : null;
  const source = isExternal ? "external" : "own";

  if (!url) {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 p-6">
        <div className="flex min-h-[14rem] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#05070d]/70 p-6 text-center text-sm text-slate-400">
          <div>
            <PlayCircle className="mx-auto mb-3 h-10 w-10 text-slate-500" />
            Видео пока не добавлено. Используйте фото и шаги ниже.
          </div>
        </div>
      </div>
    );
  }

  const analyticsParams = { lineupSlug, map, utilityType, source };

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 shadow-[0_22px_80px_rgba(0,0,0,0.28)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
        <div>
          <h2 className="text-xl font-black text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {isExternal ? "Видео из стороннего источника. Watermark и авторство сохранены." : "Видео загружается без автоплея, только metadata."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isExternal ? (
            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-100">Внешний источник</span>
          ) : null}
          {sourceName ? (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-slate-200">{sourceName}</span>
          ) : null}
        </div>
      </div>

      <div className="relative bg-[#05070d]">
        {failed ? (
          <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-slate-400">Видео не удалось загрузить.</div>
        ) : isDirectVideo(url) && !isExternal ? (
          <video
            controls
            playsInline
            preload="metadata"
            poster={posterUrl ?? undefined}
            onPlay={() => trackGoal("video_play", analyticsParams)}
            onError={() => setFailed(true)}
            className="aspect-video w-full bg-black"
          >
            <source src={url} />
            Видео не поддерживается вашим браузером.
          </video>
        ) : embedUrl ? (
          <iframe
            title={title}
            src={embedUrl}
            className="aspect-video w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex aspect-video items-center justify-center p-6 text-center">
            <div>
              <Video className="mx-auto mb-3 h-10 w-10 text-cyan-200" />
              <div className="text-lg font-black text-white">Видео доступно у источника</div>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Встраивание недоступно, поэтому открываем оригинал в новой вкладке.</p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackGoal("external_video_open", { lineupSlug, sourceName, sourceUrl: url })}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-orange-400/35 bg-[#ff5500] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#f97316]"
              >
                <ExternalLink className="h-4 w-4" />
                Смотреть видео
              </a>
            </div>
          </div>
        )}
      </div>

      {(sourceUrl || sourceName || credit) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-4 text-sm text-slate-300">
          <span>{credit ?? (sourceName ? `Источник: ${sourceName}` : "Источник сохранён")}</span>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackGoal("source_open", { lineupSlug, sourceName, sourceUrl })}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 font-semibold text-cyan-100 transition hover:border-cyan-300/40"
            >
              <ExternalLink className="h-4 w-4" />
              Открыть оригинал
            </a>
          ) : null}
        </div>
      )}
    </section>
  );
}
