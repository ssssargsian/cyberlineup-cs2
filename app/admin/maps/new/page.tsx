import Link from "next/link";

import { createMapAction } from "@/app/admin/actions";
import { AdminMapForm } from "@/components/AdminMapForm";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default function NewMapPage() {
  requireAdmin();

  return (
    <div className="space-y-6 pb-16">
      <Link href="/admin" className="text-sm text-cyan-200">
        ← Назад в админку
      </Link>
      <div>
        <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Карты</div>
        <h1 className="mt-2 text-3xl font-semibold text-white">Создать карту</h1>
        <p className="mt-3 text-sm text-slate-400">Карта сразу станет доступна в фильтрах, поиске и сопоставлении импортированных данных.</p>
      </div>
      <AdminMapForm action={createMapAction} />
    </div>
  );
}
