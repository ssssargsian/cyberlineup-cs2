import Link from "next/link";

export default function NotFound() {
  return (
    <div className="glass-card mx-auto flex max-w-2xl flex-col items-center gap-4 overflow-hidden rounded-[2rem] p-10 text-center">
      <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-300">404</div>
      <h1 className="text-4xl font-semibold text-white">Страница не найдена</h1>
      <p className="max-w-xl text-slate-400">Нужная карта или раскид либо не существует, либо пока не опубликован после модерации.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/search" className="admin-button">
          Вернуться к поиску
        </Link>
        <Link href="/" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:border-cyan-400/25 hover:bg-cyan-400/10">
          На главную
        </Link>
      </div>
    </div>
  );
}
