import type { Difficulty, Side, UtilityType } from "@prisma/client";

type FiltersProps = {
  values: {
    utilityType?: UtilityType | "";
    side?: Side | "";
    area?: string;
    difficulty?: Difficulty | "";
  };
};

export function Filters({ values }: FiltersProps) {
  return (
    <form className="panel mb-8 grid gap-4 p-5 lg:grid-cols-5" method="get">
      <label className="space-y-2 text-sm">
        <span className="text-muted">Тип гранаты</span>
        <select
          name="utilityType"
          defaultValue={values.utilityType ?? ""}
          className="w-full rounded-2xl border border-line bg-black/20 px-4 py-3 text-text outline-none focus:border-accent/50"
        >
          <option value="">Все</option>
          <option value="smoke">smoke</option>
          <option value="flash">flash</option>
          <option value="molotov">molotov</option>
          <option value="he">he</option>
        </select>
      </label>

      <label className="space-y-2 text-sm">
        <span className="text-muted">Сторона</span>
        <select
          name="side"
          defaultValue={values.side ?? ""}
          className="w-full rounded-2xl border border-line bg-black/20 px-4 py-3 text-text outline-none focus:border-accent/50"
        >
          <option value="">Все</option>
          <option value="t">T</option>
          <option value="ct">CT</option>
        </select>
      </label>

      <label className="space-y-2 text-sm">
        <span className="text-muted">Зона</span>
        <input
          name="area"
          defaultValue={values.area ?? ""}
          placeholder="A, B, Mid, Connector"
          className="w-full rounded-2xl border border-line bg-black/20 px-4 py-3 text-text outline-none placeholder:text-muted focus:border-accent/50"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="text-muted">Сложность</span>
        <select
          name="difficulty"
          defaultValue={values.difficulty ?? ""}
          className="w-full rounded-2xl border border-line bg-black/20 px-4 py-3 text-text outline-none focus:border-accent/50"
        >
          <option value="">Все</option>
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>
      </label>

      <div className="flex items-end gap-3">
        <button
          type="submit"
          className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-accent to-accent2 px-5 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950"
        >
          Применить
        </button>
        <a
          href="."
          className="inline-flex h-12 items-center justify-center rounded-2xl border border-line px-5 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-text"
        >
          Сбросить
        </a>
      </div>
    </form>
  );
}
