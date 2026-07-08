import Link from "next/link";
import { notFound } from "next/navigation";

import { updateLineupAction } from "@/app/admin/actions";
import { AdminLineupForm } from "@/components/AdminLineupForm";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatLineupTitleRu } from "@/src/lib/i18n/lineupDisplay";

export const dynamic = "force-dynamic";

export default async function EditLineupPage({ params }: { params: { id: string } }) {
  requireAdmin();

  const [maps, lineup] = await Promise.all([
    prisma.map.findMany({ orderBy: { name: "asc" } }),
    prisma.lineup.findUnique({ where: { id: Number(params.id) } })
  ]);

  if (!lineup) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-16">
      <Link href="/admin" className="text-sm text-cyan-200">
        ← Назад в админку
      </Link>
      <div>
        <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Редактирование раскида</div>
        <h1 className="mt-2 text-3xl font-semibold text-white">{formatLineupTitleRu(lineup.title)}</h1>
        <p className="mt-3 text-sm text-slate-400">Отсюда можно дополнять импортированные записи и переводить их в опубликованные.</p>
      </div>
      <AdminLineupForm action={updateLineupAction} maps={maps} lineup={lineup} />
    </div>
  );
}
