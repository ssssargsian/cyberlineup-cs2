import Link from "next/link";

import { createLineupAction } from "@/app/admin/actions";
import { AdminLineupForm } from "@/components/AdminLineupForm";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewLineupPage() {
  requireAdmin();
  const maps = await prisma.map.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6 pb-16">
      <Link href="/admin" className="text-sm text-cyan-200">
        ← Назад в админку
      </Link>
      <div>
        <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Ручное создание</div>
        <h1 className="mt-2 text-3xl font-semibold text-white">Создать новый раскид</h1>
        <p className="mt-3 text-sm text-slate-400">Можно создать опубликованную запись вручную или сразу сохранить её как черновик/на модерации.</p>
      </div>
      <AdminLineupForm action={createLineupAction} maps={maps} />
    </div>
  );
}
