import { ImportSourceType, LineupStatus, Prisma, UtilityType } from "@prisma/client";
import Link from "next/link";

import {
  createImportSourceAction,
  createMapAction,
  deleteLineupAction,
  deleteMapAction,
  loginAdminAction,
  logoutAdminAction,
  publishLineupAction,
  rejectLineupAction,
  runImportAction
} from "@/app/admin/actions";
import { AdminMapForm } from "@/components/AdminMapForm";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTable } from "@/components/AdminTable";
import { ImportJobStatus } from "@/components/ImportJobStatus";
import { isAdminAuthenticated } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminPagination } from "@/src/components/admin/AdminPagination";
import { formatAreaRu, formatLineupTitleRu, formatStatusRu, formatUtilityTypeRu } from "@/src/lib/i18n/lineupDisplay";

export const dynamic = "force-dynamic";

type AdminSearchParams = {
  error?: string;
  page?: string;
  pageSize?: string;
  status?: string;
  map?: string;
  utilityType?: string;
  q?: string;
};

const pageSizeOptions = [25, 50, 100];

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePageSize(value: string | undefined) {
  const parsed = parsePositiveInt(value, 25);
  return pageSizeOptions.includes(parsed) ? parsed : 25;
}

function isLineupStatus(value: string | undefined): value is LineupStatus {
  return Boolean(value && Object.values(LineupStatus).includes(value as LineupStatus));
}

function isUtilityType(value: string | undefined): value is UtilityType {
  return Boolean(value && Object.values(UtilityType).includes(value as UtilityType));
}

export default async function AdminPage({
  searchParams
}: {
  searchParams?: AdminSearchParams;
}) {
  const isAuthenticated = isAdminAuthenticated();

  if (!process.env.ADMIN_PASSWORD) {
    return (
      <div className="glass-card mx-auto max-w-2xl rounded-[2rem] p-10 text-center">
        <h1 className="text-3xl font-semibold text-white">ADMIN_PASSWORD не настроен</h1>
        <p className="mt-4 text-slate-400">Добавьте переменную окружения, чтобы открыть модерационную админку CyberLineup.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl">
        <form action={loginAdminAction} className="glass-card space-y-5 rounded-[2rem] p-8">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Доступ администратора</div>
            <h1 className="mt-2 text-3xl font-semibold text-white">Админка CyberLineup</h1>
            <p className="mt-3 text-sm text-slate-400">Пароль даёт доступ к модерации импортов, CRUD по базе и запуску импорт-пайплайна.</p>
          </div>
          <label className="space-y-2 text-sm">
            <span className="text-slate-400">Пароль</span>
            <input type="password" name="password" required className="admin-input" />
          </label>
          {searchParams?.error === "invalid-password" ? <p className="text-sm text-rose-300">Неверный пароль.</p> : null}
          <button type="submit" className="admin-button">
            Войти
          </button>
        </form>
      </div>
    );
  }

  const page = parsePositiveInt(searchParams?.page, 1);
  const pageSize = parsePageSize(searchParams?.pageSize);
  const q = searchParams?.q?.trim() ?? "";
  const status = isLineupStatus(searchParams?.status) ? searchParams.status : undefined;
  const utilityType = isUtilityType(searchParams?.utilityType) ? searchParams.utilityType : undefined;
  const mapSlug = searchParams?.map?.trim() || undefined;
  const lineupWhere: Prisma.LineupWhereInput = {
    ...(status ? { status } : {}),
    ...(utilityType ? { utilityType } : {}),
    ...(mapSlug ? { map: { slug: mapSlug } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { fromPosition: { contains: q, mode: "insensitive" } },
            { targetPosition: { contains: q, mode: "insensitive" } },
            { sourceName: { contains: q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [maps, lineups, lineupsTotal, totalLineups, publishedCount, pendingCount, drafts, sources, jobs] = await Promise.all([
    prisma.map.findMany({
      include: {
        _count: {
          select: {
            lineups: true
          }
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.lineup.findMany({
      where: lineupWhere,
      include: { map: true },
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.lineup.count({ where: lineupWhere }),
    prisma.lineup.count(),
    prisma.lineup.count({ where: { status: LineupStatus.published } }),
    prisma.lineup.count({ where: { status: { in: [LineupStatus.draft, LineupStatus.pending_review] } } }),
    prisma.lineup.findMany({
      where: { status: { in: [LineupStatus.draft, LineupStatus.pending_review] } },
      include: { map: true },
      orderBy: [{ updatedAt: "desc" }],
      take: 25
    }),
    prisma.importSource.findMany({
      orderBy: { updatedAt: "desc" }
    }),
    prisma.importJob.findMany({
      include: { source: true },
      orderBy: { createdAt: "desc" },
      take: 12
    })
  ]);

  return (
    <div className="grid min-w-0 gap-8 pb-16 lg:grid-cols-[18rem,minmax(0,1fr)]">
      <AdminSidebar />

      <div className="space-y-8">
        <section className="glass-card rounded-[2.5rem] p-6 sm:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Дашборд</div>
              <h1 className="mt-2 text-4xl font-semibold text-white">Модерация, импорт и база раскидов</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                Только published-записи попадают на публичный сайт. Импортированные материалы всегда проходят через draft или pending_review.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/lineups/new" className="admin-button">
                Новый раскид
              </Link>
              <Link href="/admin/maps/new" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:border-cyan-400/20 hover:bg-cyan-400/10">
                Новая карта
              </Link>
              <form action={runImportAction}>
                <button type="submit" className="rounded-2xl border border-violet-400/20 bg-violet-500/10 px-5 py-3 text-sm text-violet-200 transition hover:bg-violet-500/15">
                  Запустить импорт
                </button>
              </form>
              <form action={logoutAdminAction}>
                <button type="submit" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 transition hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-white">
                  Выйти
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              { label: "Карты", value: maps.length },
              { label: "Все раскиды", value: totalLineups },
              { label: "Опубликовано", value: publishedCount },
              { label: "Черновики + модерация", value: pendingCount }
            ].map((item) => (
              <div key={item.label} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</div>
                <div className="mt-3 text-4xl font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="drafts" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Черновики импорта</h2>
            <p className="mt-2 text-sm text-slate-400">Здесь лежат только записи, которые требуют ручного подтверждения или доработки.</p>
          </div>
          <AdminTable headers={["Название", "Карта", "Статус", "Источник", "Действия"]}>
            {drafts.map((lineup) => (
              <tr key={lineup.id} className="border-t border-white/8">
                <td className="px-4 py-4">
                  <div className="font-medium text-white">{formatLineupTitleRu(lineup.title)}</div>
                  <div className="mt-1 text-xs text-slate-500">/{lineup.slug}</div>
                </td>
                <td className="px-4 py-4">{lineup.map.name}</td>
                <td className="px-4 py-4">{formatStatusRu(lineup.status)}</td>
                <td className="px-4 py-4">{lineup.sourceName ?? "Ручная запись"}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/lineups/${lineup.id}/edit`} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white">
                      Редактировать
                    </Link>
                    <form action={publishLineupAction}>
                      <input type="hidden" name="id" value={lineup.id} />
                      <button type="submit" className="rounded-xl border border-emerald-400/20 px-3 py-2 text-xs text-emerald-200">
                        Опубликовать
                      </button>
                    </form>
                    <form action={rejectLineupAction}>
                      <input type="hidden" name="id" value={lineup.id} />
                      <button type="submit" className="rounded-xl border border-rose-400/20 px-3 py-2 text-xs text-rose-200">
                        Отклонить
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        </section>

        <section id="lineups" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Раскиды</h2>
            <p className="mt-2 text-sm text-slate-400">Полный список записей, включая ручные и импортированные.</p>
          </div>
          <form className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/80 p-4 md:grid-cols-5" method="get">
            <label className="space-y-2 text-sm">
              <span className="text-slate-400">Поиск</span>
              <input name="q" defaultValue={q} className="admin-input" placeholder="Название, slug, позиция" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-400">Статус</span>
              <select name="status" defaultValue={status ?? ""} className="admin-input">
                <option value="">Все</option>
                {Object.values(LineupStatus).map((value) => (
                  <option key={value} value={value}>
                    {formatStatusRu(value)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-400">Карта</span>
              <select name="map" defaultValue={mapSlug ?? ""} className="admin-input">
                <option value="">Все</option>
                {maps.map((map) => (
                  <option key={map.id} value={map.slug}>
                    {map.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-400">Тип</span>
              <select name="utilityType" defaultValue={utilityType ?? ""} className="admin-input">
                <option value="">Все</option>
                {Object.values(UtilityType).map((value) => (
                  <option key={value} value={value}>
                    {formatUtilityTypeRu(value)}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button type="submit" className="admin-button w-full">
                Применить
              </button>
            </div>
          </form>
          <AdminTable headers={["Название", "Карта", "Тип", "Статус", "Действия"]}>
            {lineups.map((lineup) => (
              <tr key={lineup.id} className="border-t border-white/8">
                <td className="px-4 py-4">
                  <div className="font-medium text-white">{formatLineupTitleRu(lineup.title)}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatAreaRu(lineup.area)}</div>
                </td>
                <td className="px-4 py-4">{lineup.map.name}</td>
                <td className="px-4 py-4">{formatUtilityTypeRu(lineup.utilityType)}</td>
                <td className="px-4 py-4">{formatStatusRu(lineup.status)}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/lineups/${lineup.id}/edit`} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white">
                      Редактировать
                    </Link>
                    <form action={deleteLineupAction}>
                      <input type="hidden" name="id" value={lineup.id} />
                      <button type="submit" className="rounded-xl border border-rose-400/20 px-3 py-2 text-xs text-rose-200">
                        Удалить
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
          <AdminPagination
            page={page}
            pageSize={pageSize}
            total={lineupsTotal}
            basePath="/admin"
            searchParams={{ ...(searchParams ?? {}) }}
          />
        </section>

        <section id="sources" className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Источники импорта</h2>
              <p className="mt-2 text-sm text-slate-400">Архитектура рассчитана на website, youtube, api и manual источники.</p>
            </div>
            <AdminTable headers={["Название", "Base URL", "Тип", "Включён", "Последний импорт"]}>
              {sources.map((source) => (
                <tr key={source.id} className="border-t border-white/8">
                  <td className="px-4 py-4 text-white">{source.name}</td>
                  <td className="px-4 py-4 text-slate-400">{source.baseUrl}</td>
                  <td className="px-4 py-4">{source.type}</td>
                  <td className="px-4 py-4">{source.isEnabled ? "Да" : "Нет"}</td>
                  <td className="px-4 py-4 text-slate-400">{source.lastImportedAt ? new Intl.DateTimeFormat("ru-RU").format(source.lastImportedAt) : "—"}</td>
                </tr>
              ))}
            </AdminTable>
          </div>

          <form action={createImportSourceAction} className="glass-card space-y-5 rounded-[2rem] p-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Добавить источник</h3>
              <p className="mt-2 text-sm text-slate-400">Новый источник попадёт в общий import pipeline и не будет публиковать записи автоматически.</p>
            </div>
            <label className="space-y-2 text-sm">
              <span className="text-slate-400">Название</span>
              <input name="name" required className="admin-input" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-400">Base URL</span>
              <input name="baseUrl" required className="admin-input" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-400">Тип</span>
              <select name="type" defaultValue={ImportSourceType.website} className="admin-input">
                <option value="website">website</option>
                <option value="youtube">youtube</option>
                <option value="api">api</option>
                <option value="manual">manual</option>
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" name="isEnabled" defaultChecked className="h-5 w-5 rounded border-white/20 bg-slate-900" />
              Включён
            </label>
            <button type="submit" className="admin-button">
              Сохранить источник
            </button>
          </form>
        </section>

        <section id="jobs" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Задачи импорта</h2>
            <p className="mt-2 text-sm text-slate-400">История запусков импорта, найденных кандидатов и ошибок.</p>
          </div>
          <AdminTable headers={["Источник", "Статус", "Найдено", "Импортировано", "Пропущено", "Ошибка"]}>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-white/8">
                <td className="px-4 py-4 text-white">{job.source.name}</td>
                <td className="px-4 py-4">
                  <ImportJobStatus value={job.status} />
                </td>
                <td className="px-4 py-4">{job.foundCount}</td>
                <td className="px-4 py-4">{job.importedCount}</td>
                <td className="px-4 py-4">{job.skippedCount}</td>
                <td className="px-4 py-4 text-xs text-slate-500">{job.errorMessage?.slice(0, 140) ?? "—"}</td>
              </tr>
            ))}
          </AdminTable>
        </section>

        <section id="maps" className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Карты</h2>
              <p className="mt-2 text-sm text-slate-400">Карты используются и в публичном интерфейсе, и в импорт-пайплайне.</p>
            </div>
            <AdminTable headers={["Карта", "Slug", "Раскиды", "Действия"]}>
              {maps.map((map) => (
                <tr key={map.id} className="border-t border-white/8">
                  <td className="px-4 py-4 text-white">{map.name}</td>
                  <td className="px-4 py-4 text-slate-400">{map.slug}</td>
                  <td className="px-4 py-4">{map._count.lineups}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/maps/${map.id}/edit`} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white">
                        Редактировать
                      </Link>
                      <form action={deleteMapAction}>
                        <input type="hidden" name="id" value={map.id} />
                        <button type="submit" className="rounded-xl border border-rose-400/20 px-3 py-2 text-xs text-rose-200">
                          Удалить
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-white">Создать карту</h3>
            <AdminMapForm action={createMapAction} />
          </div>
        </section>

        <section id="settings" className="glass-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold text-white">Настройки</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Основные настройки пока завязаны на `.env`: `DATABASE_URL`, `ADMIN_PASSWORD`, `OPENAI_API_KEY`,
            `NEXT_PUBLIC_APP_URL`, `RASKIDKI_SOURCE_URL`, `ENABLE_WEB_FALLBACK`, `IMAGE_STORAGE_MODE`.
          </p>
        </section>
      </div>
    </div>
  );
}
