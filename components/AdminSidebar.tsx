import { Boxes, DatabaseZap, LayoutDashboard, Map, ScrollText, Settings2, UploadCloud } from "lucide-react";
import Link from "next/link";

const sections = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/imports", label: "Импорт", icon: UploadCloud },
  { href: "/admin#lineups", label: "Раскиды", icon: ScrollText },
  { href: "/admin#drafts", label: "Черновики импорта", icon: Boxes },
  { href: "/admin#sources", label: "Источники", icon: UploadCloud },
  { href: "/admin#jobs", label: "Задачи импорта", icon: DatabaseZap },
  { href: "/admin#maps", label: "Карты", icon: Map },
  { href: "/admin#settings", label: "Настройки", icon: Settings2 }
];

export function AdminSidebar() {
  return (
    <aside className="glass-card sticky top-28 h-fit rounded-[2rem] p-4">
      <div className="mb-4 text-xs uppercase tracking-[0.28em] text-slate-500">Управление</div>
      <div className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.label}
              href={section.href}
              className="flex items-center gap-3 rounded-2xl border border-white/8 px-4 py-3 text-sm text-slate-300 transition hover:border-cyan-400/25 hover:bg-cyan-400/10 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
