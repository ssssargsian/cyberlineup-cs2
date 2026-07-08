import Link from "next/link";

import { ButtonLink } from "@/src/components/ui/Button";

export default function NotFound() {
  return (
    <div className="tactical-panel mx-auto flex max-w-2xl flex-col items-center gap-4 p-10 text-center">
      <div className="relative rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-orange-200">404</div>
      <h1 className="relative text-4xl font-black text-white">Раскид не найден или пока не опубликован</h1>
      <p className="relative max-w-xl text-slate-300">Нужная карта или раскид либо не существует, либо ещё не прошёл модерацию.</p>
      <div className="relative flex flex-wrap justify-center gap-3">
        <ButtonLink href="/search">К поиску</ButtonLink>
        <Link href="/" className="inline-flex items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/45">
          На главную
        </Link>
      </div>
    </div>
  );
}
