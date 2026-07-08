import Link from "next/link";
import { notFound } from "next/navigation";

import { updateMapAction } from "@/app/admin/actions";
import { AdminMapForm } from "@/components/AdminMapForm";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditMapPage({ params }: { params: { id: string } }) {
  requireAdmin();

  const map = await prisma.map.findUnique({
    where: { id: Number(params.id) }
  });

  if (!map) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-16">
      <Link href="/admin" className="text-sm text-cyan-200">
        ← Назад в админку
      </Link>
      <div>
        <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Редактирование карты</div>
        <h1 className="mt-2 text-3xl font-semibold text-white">{map.name}</h1>
        <p className="mt-3 text-sm text-slate-400">Обновляйте hero-описание и URL изображения для карты.</p>
      </div>
      <AdminMapForm action={updateMapAction} map={map} />
    </div>
  );
}
