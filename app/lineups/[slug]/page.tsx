import { Crosshair, ExternalLink, Flag, MapPinned, Route, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/Badge";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { LineupCard } from "@/components/LineupCard";
import { SourceBadge } from "@/components/SourceBadge";
import { UtilityTypeBadge } from "@/components/UtilityTypeBadge";
import { VideoEmbed } from "@/components/VideoEmbed";
import { prisma } from "@/lib/prisma";
import { ImportedImage } from "@/src/components/ImportedImage";
import type { LineupImage, LineupStep } from "@/src/lib/importers/types";
import { formatAreaRu, formatLineupTitleRu, formatMapNameRu, formatSideRu, formatStatusRu, formatThrowTypeRu } from "@/src/lib/i18n/lineupDisplay";
import { LineupStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function parseLineupSteps(value: unknown): LineupStep[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((step) => {
    if (typeof step === "string") {
      return { title: "Шаг", text: step, imageUrl: null, sourceImageUrl: null, localImageUrl: null };
    }

    if (step && typeof step === "object") {
      const candidate = step as Record<string, unknown>;
      return {
        title: String(candidate.title ?? "Шаг"),
        text: String(candidate.text ?? candidate.title ?? ""),
        imageUrl: candidate.imageUrl ? String(candidate.imageUrl) : null,
        sourceImageUrl: candidate.sourceImageUrl ? String(candidate.sourceImageUrl) : null,
        localImageUrl: candidate.localImageUrl ? String(candidate.localImageUrl) : null
      };
    }

    return { title: "Шаг", text: String(step), imageUrl: null, sourceImageUrl: null, localImageUrl: null };
  });
}

function parseLineupImages(value: unknown): LineupImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((image) => {
      if (!image || typeof image !== "object") {
        return null;
      }

      const candidate = image as Record<string, unknown>;
      const url = candidate.url ? String(candidate.url) : null;
      const sourceUrl = candidate.sourceUrl ? String(candidate.sourceUrl) : url;

      if (!url || !sourceUrl) {
        return null;
      }

      return {
        url,
        sourceUrl,
        localUrl: candidate.localUrl ? String(candidate.localUrl) : null,
        alt: String(candidate.alt ?? "Lineup image"),
        role: ["preview", "position", "aim", "step", "gallery"].includes(String(candidate.role)) ? (String(candidate.role) as LineupImage["role"]) : "gallery",
        stepIndex: typeof candidate.stepIndex === "number" ? candidate.stepIndex : null
      } satisfies LineupImage;
    })
    .filter((image): image is LineupImage => image !== null);
}

export default async function LineupPage({ params }: { params: { slug: string } }) {
  const requestedSlug = decodeURIComponent(params.slug);
  const lineup = await prisma.lineup.findUnique({
    where: { slug: requestedSlug },
    include: { map: true }
  });

  if (!lineup || lineup.status !== LineupStatus.published) {
    notFound();
  }

  const similar = await prisma.lineup.findMany({
    where: {
      id: { not: lineup.id },
      status: LineupStatus.published,
      mapId: lineup.mapId,
      area: lineup.area,
      NOT: {
        OR: [
          { slug: { startsWith: "demo-" } },
          { sourceName: { contains: "Demo", mode: "insensitive" } },
          { tags: { has: "demo" } }
        ]
      }
    },
    include: { map: true },
    take: 3,
    orderBy: [{ isVerified: "desc" }, { updatedAt: "desc" }]
  });

  const currentUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/lineups/${lineup.slug}`;
  const steps = parseLineupSteps(lineup.steps);
  const images = parseLineupImages(lineup.images);
  const galleryImages = images.filter((image) => image.role === "gallery" || image.stepIndex === null);
  const heroImageUrl = lineup.previewImageUrl ?? images[0]?.url ?? steps.find((step) => step.imageUrl)?.imageUrl ?? null;
  const displayTitle = formatLineupTitleRu(lineup.title);
  const displayMapName = formatMapNameRu(lineup.map.name, lineup.map.slug);

  return (
    <div className="space-y-8 pb-16">
      <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0f18]/95 shadow-[0_28px_110px_rgba(0,0,0,0.36)]">
        <div className="relative min-h-[18rem] border-b border-white/10 sm:min-h-[24rem]">
          <ImportedImage src={heroImageUrl} alt={displayTitle} className="absolute inset-0" imgClassName="object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070D]/92 via-[#05070D]/38 to-black/10" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />
          <div className="relative flex min-h-[18rem] flex-col justify-end p-6 sm:min-h-[24rem] sm:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <UtilityTypeBadge value={lineup.utilityType} />
              <DifficultyBadge value={lineup.difficulty} />
              <Badge>{formatSideRu(lineup.side)}</Badge>
              {lineup.isVerified ? <Badge className="border-emerald-400/25 bg-emerald-500/10 text-emerald-200">Проверено</Badge> : null}
              <SourceBadge name={lineup.sourceName} />
            </div>
            <h1 className="max-w-5xl text-4xl font-black leading-tight text-white sm:text-6xl">{displayTitle}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-200">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1 font-semibold text-orange-100">
                <MapPinned className="h-4 w-4" />
                {displayMapName}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1">
                <Route className="h-4 w-4 text-cyan-200" />
                {lineup.fromPosition ?? "Позиция не указана"} → {lineup.targetPosition ?? "Цель не указана"}
              </span>
            </div>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">{lineup.description ?? "Описание пока не добавлено."}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-4">
          <div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Карта</div>
                <Link href={`/maps/${lineup.map.slug}`} className="inline-flex items-center gap-2 text-lg font-black text-cyan-200">
                  <MapPinned className="h-4 w-4" />
                  {displayMapName}
                </Link>
              </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Зона</div>
                <div className="inline-flex items-center gap-2 text-lg font-black text-white">
                  <Crosshair className="h-4 w-4 text-orange-200" />
                  {formatAreaRu(lineup.area)}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Откуда</div>
                <div className="truncate text-lg font-black text-white">{lineup.fromPosition ?? "Не указано"}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Куда</div>
                <div className="truncate text-lg font-black text-white">{lineup.targetPosition ?? "Не указано"}</div>
              </div>

            <div className="mt-6 flex flex-wrap gap-3 lg:col-span-4">
              <CopyLinkButton url={currentUrl} />
              <a
                href={`mailto:raskidki-granat@mail.ru?subject=${encodeURIComponent(`Ошибка в раскиде: ${displayTitle}`)}&body=${encodeURIComponent(`Проверьте раскид: ${currentUrl}`)}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-400/30 hover:bg-red-500/10"
              >
                <Flag className="h-4 w-4" />
                Сообщить об ошибке
              </a>
              {lineup.sourceUrl ? (
                <a
                  href={lineup.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-100 transition hover:border-orange-300/40 hover:bg-orange-500/15"
                >
                  <ExternalLink className="h-4 w-4" />
                  Источник
                </a>
              ) : null}
            </div>
        </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr),24rem]">
        <div className="space-y-6">
        <div className="rounded-[1.75rem] border border-white/10 bg-[#0b0f18]/95 p-6 shadow-[0_22px_80px_rgba(0,0,0,0.3)]">
          <h2 className="text-3xl font-black text-white">Как кинуть</h2>
          <ol className="mt-5 space-y-3">
            {steps.length ? (
              steps.map((step, index) => (
                <li key={`${step.title}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-200">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="md:min-w-20">
                      <div className="text-3xl font-black text-orange-200">{String(index + 1).padStart(2, "0")}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-black text-white">{step.title}</div>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{step.text}</p>
                      <ImportedImage
                        src={step.localImageUrl ?? step.imageUrl}
                        alt={step.title}
                        fallbackLabel="Фото шага пока нет"
                        className="mt-4 aspect-video w-full rounded-2xl border border-white/10"
                        imgClassName="transition duration-500 hover:scale-[1.02]"
                      />
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">Шаги пока не добавлены.</li>
            )}
          </ol>
        </div>

        {galleryImages.length ? (
          <section className="space-y-5">
            <h2 className="text-3xl font-black text-white">Фотографии</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {galleryImages.map((image) => (
                <a key={image.url} href={image.sourceUrl} target="_blank" rel="noreferrer" className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 transition hover:-translate-y-1 hover:border-cyan-400/25">
                  <ImportedImage src={image.localUrl ?? image.url} alt={image.alt} className="aspect-video w-full" imgClassName="transition duration-500 hover:scale-[1.03]" />
                </a>
              ))}
            </div>
          </section>
        ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <VideoEmbed url={lineup.videoUrl} />

          <div className="rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 p-6 shadow-[0_22px_80px_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-black text-white">Детали раскида</h2>
            <div className="mt-5 grid gap-3 text-sm text-slate-300">
              <div className="flex justify-between gap-4 border-b border-white/8 pb-3"><span>Карта</span><span className="text-white">{displayMapName}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/8 pb-3"><span>Тип гранаты</span><span className="text-white">{lineup.utilityType === "unknown" ? "Не указана" : <UtilityTypeBadge value={lineup.utilityType} />}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/8 pb-3"><span>Зона</span><span className="text-white">{formatAreaRu(lineup.area)}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/8 pb-3"><span>Сторона</span><span className="text-white">{formatSideRu(lineup.side)}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/8 pb-3"><span>Сложность</span><span className="text-white">{lineup.difficulty === "unknown" ? "Не указана" : <DifficultyBadge value={lineup.difficulty} />}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/8 pb-3"><span>Тип броска</span><span className="text-white">{formatThrowTypeRu(lineup.throwType)}</span></div>
              <div className="flex justify-between gap-4"><span>Статус</span><span className="text-emerald-200">{formatStatusRu(lineup.status)}</span></div>
            </div>
            <h3 className="mt-6 text-lg font-black text-white">Теги</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {lineup.tags.length ? lineup.tags.map((tag) => <Badge key={tag}>#{tag}</Badge>) : <span className="text-sm text-slate-400">Теги не добавлены.</span>}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 p-6 shadow-[0_22px_80px_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-black text-white">Источник</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {lineup.sourceName ? `Материал импортирован из источника ${lineup.sourceName}.` : "Запись добавлена вручную через CyberLineup."}
            </p>
            {lineup.sourceUrl ? (
              <a href={lineup.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-100 transition hover:border-orange-300/40">
                <ExternalLink className="h-4 w-4" />
                Открыть оригинал
              </a>
            ) : null}
          </div>
        </aside>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-black text-white">Похожие раскиды</h2>
          <p className="text-sm text-slate-400">
            {displayMapName} • {formatAreaRu(lineup.area)}
          </p>
        </div>
        {similar.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {similar.map((item) => (
              <LineupCard key={item.id} lineup={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 p-8 text-center text-sm text-slate-400">Похожих опубликованных раскидов по этой карте и зоне пока нет.</div>
        )}
      </section>
    </div>
  );
}
