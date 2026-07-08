import { ImportSourceType, LineupStatus, Prisma } from "@prisma/client";
import Link from "next/link";

import {
  exportRaskidkiJsonAction,
  importRaskidkiJsonAction,
  hideDemoLineupsAction,
  loginAdminAction,
  logoutAdminAction,
  publishAllImportedLineupsAction,
  publishLineupAction,
  rejectLineupAction,
  syncRaskidkiAction
} from "@/app/admin/actions";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTable } from "@/components/AdminTable";
import { ImportJobStatus } from "@/components/ImportJobStatus";
import { isAdminAuthenticated } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminPagination } from "@/src/components/admin/AdminPagination";
import { formatLineupTitleRu, formatStatusRu } from "@/src/lib/i18n/lineupDisplay";

export const dynamic = "force-dynamic";

function countJsonArray(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

type AdminImportsSearchParams = {
  error?: string;
  page?: string;
  pageSize?: string;
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

export default async function AdminImportsPage({
  searchParams
}: {
  searchParams?: AdminImportsSearchParams;
}) {
  const isAuthenticated = isAdminAuthenticated();

  if (!process.env.ADMIN_PASSWORD) {
    return (
      <div className="glass-card mx-auto max-w-2xl rounded-[2rem] p-10 text-center">
        <h1 className="text-3xl font-semibold text-white">ADMIN_PASSWORD не настроен</h1>
        <p className="mt-4 text-slate-400">Добавьте переменную окружения, чтобы открыть админку импортов CyberLineup.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl">
        <form action={loginAdminAction} className="glass-card space-y-5 rounded-[2rem] p-8">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Доступ администратора</div>
            <h1 className="mt-2 text-3xl font-semibold text-white">Импорт CyberLineup</h1>
            <p className="mt-3 text-sm text-slate-400">Пароль даёт доступ к экспорту JSON, импорту в базу и публикации pending-review раскидов.</p>
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
  const pendingWhere = { status: { in: [LineupStatus.draft, LineupStatus.pending_review] } } satisfies Prisma.LineupWhereInput;

  const [sources, jobs, pendingLineups, pendingTotal] = await Promise.all([
    prisma.importSource.findMany({
      where: { type: ImportSourceType.website },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.importJob.findMany({
      include: { source: true },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.lineup.findMany({
      where: pendingWhere,
      include: { map: true },
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.lineup.count({ where: pendingWhere })
  ]);

  return (
    <div className="grid min-w-0 gap-8 pb-16 lg:grid-cols-[18rem,minmax(0,1fr)]">
      <AdminSidebar />

      <div className="space-y-8">
        <section className="glass-card rounded-[2.5rem] p-6 sm:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Импорт</div>
              <h1 className="mt-2 text-4xl font-semibold text-white">Crawler, JSON export и импорт в базу</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                Импорт идёт только из публичного раздела сайта-источника и всегда оставляет записи в draft или pending_review до ручной публикации.
              </p>
            </div>
            <form action={logoutAdminAction}>
              <button type="submit" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 transition hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-white">
                Выйти
              </button>
            </form>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <form action={exportRaskidkiJsonAction}>
              <button type="submit" className="admin-button w-full">
                Собрать JSON
              </button>
            </form>
            <form action={importRaskidkiJsonAction}>
              <button type="submit" className="w-full rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-sm text-cyan-100 transition hover:bg-cyan-500/15">
                Импортировать в базу
              </button>
            </form>
            <form action={syncRaskidkiAction}>
              <button type="submit" className="w-full rounded-2xl border border-violet-400/20 bg-violet-500/10 px-5 py-3 text-sm text-violet-100 transition hover:bg-violet-500/15">
                Синхронизировать
              </button>
            </form>
            <form action={hideDemoLineupsAction}>
              <button type="submit" className="w-full rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-3 text-sm text-rose-100 transition hover:bg-rose-500/15">
                Скрыть demo-данные
              </button>
            </form>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Источники импорта</h2>
            <p className="mt-2 text-sm text-slate-400">Поддерживаются только публичные website-source записи, которые проходят проверку robots.txt.</p>
          </div>
          <AdminTable headers={["Название", "Base URL", "Включён", "Последний импорт"]}>
            {sources.map((source) => (
              <tr key={source.id} className="border-t border-white/8">
                <td className="px-4 py-4 text-white">{source.name}</td>
                <td className="px-4 py-4 text-slate-400">{source.baseUrl}</td>
                <td className="px-4 py-4">{source.isEnabled ? "Да" : "Нет"}</td>
                <td className="px-4 py-4 text-slate-400">{source.lastImportedAt ? new Intl.DateTimeFormat("ru-RU").format(source.lastImportedAt) : "—"}</td>
              </tr>
            ))}
          </AdminTable>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Задачи импорта</h2>
            <p className="mt-2 text-sm text-slate-400">История запусков sync/import с количеством найденных и импортированных раскидов.</p>
          </div>
          <AdminTable headers={["Задача", "Источник", "Статус", "Найдено", "Импортировано", "Пропущено", "Завершено"]}>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-white/8">
                <td className="px-4 py-4 text-white">#{job.id}</td>
                <td className="px-4 py-4 text-slate-300">{job.source.name}</td>
                <td className="px-4 py-4">
                  <ImportJobStatus value={job.status} />
                </td>
                <td className="px-4 py-4">{job.foundCount}</td>
                <td className="px-4 py-4">{job.importedCount}</td>
                <td className="px-4 py-4">{job.skippedCount}</td>
                <td className="px-4 py-4 text-slate-400">{job.finishedAt ? new Intl.DateTimeFormat("ru-RU").format(job.finishedAt) : "—"}</td>
              </tr>
            ))}
          </AdminTable>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">На модерации</h2>
            <p className="mt-2 text-sm text-slate-400">Эти раскиды ещё не опубликованы публично и требуют ручной проверки.</p>
          </div>
          <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
            Проверьте корректность данных и наличие источника перед публикацией.
            <form action={publishAllImportedLineupsAction} className="mt-3">
              <button type="submit" className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-medium text-amber-100 transition hover:bg-amber-300/15">
                Опубликовать все импортированные
              </button>
            </form>
          </div>
          <AdminTable headers={["Название", "Карта", "Медиа", "Статус", "Источник", "Действия"]}>
            {pendingLineups.map((lineup) => (
              <tr key={lineup.id} className="border-t border-white/8">
                <td className="px-4 py-4">
                  <div className="font-medium text-white">{formatLineupTitleRu(lineup.title)}</div>
                  <div className="mt-1 text-xs text-slate-500">{lineup.fromPosition ?? "—"} → {lineup.targetPosition ?? "—"}</div>
                </td>
                <td className="px-4 py-4">{lineup.map.name}</td>
                <td className="px-4 py-4 text-xs text-slate-300">
                  <div>Превью: {lineup.previewImageUrl ? "есть" : "нет"}</div>
                  <div>Фото: {countJsonArray(lineup.images)}</div>
                  <div>Шаги: {countJsonArray(lineup.steps)}</div>
                </td>
                <td className="px-4 py-4">{formatStatusRu(lineup.status)}</td>
                <td className="px-4 py-4">{lineup.sourceName ?? "Ручная запись"}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/lineups/${lineup.id}/edit`} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white">
                      Редактировать
                    </Link>
                    <Link href={`/lineups/${lineup.slug}`} className="rounded-xl border border-blue-400/20 px-3 py-2 text-xs text-blue-200">
                      Открыть на сайте
                    </Link>
                    {lineup.sourceUrl ? (
                      <a href={lineup.sourceUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-cyan-400/20 px-3 py-2 text-xs text-cyan-200">
                        Открыть оригинал
                      </a>
                    ) : null}
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
          <AdminPagination
            page={page}
            pageSize={pageSize}
            total={pendingTotal}
            basePath="/admin/imports"
            searchParams={{ ...(searchParams ?? {}) }}
          />
        </section>
      </div>
    </div>
  );
}
