import type { Difficulty, Lineup, LineupStatus, Map, Side, UtilityType } from "@prisma/client";
import { formatDifficultyRu, formatSideRu, formatStatusRu, formatThrowTypeRu, formatUtilityTypeRu } from "@/src/lib/i18n/lineupDisplay";

function jsonStepsToText(steps: unknown) {
  if (!Array.isArray(steps)) {
    return "";
  }

  if (steps.every((step) => typeof step === "string")) {
    return steps.map((step) => String(step)).join("\n");
  }

  return JSON.stringify(steps, null, 2);
}

export function AdminLineupForm({
  action,
  lineup,
  maps
}: {
  action: (formData: FormData) => void | Promise<void>;
  lineup?: Lineup | null;
  maps: Map[];
}) {
  return (
    <form action={action} className="glass-card space-y-5 rounded-[2rem] p-6">
      {lineup ? <input type="hidden" name="id" value={lineup.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Название</span>
          <input name="title" required defaultValue={lineup?.title ?? ""} className="admin-input" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Slug</span>
          <input name="slug" required defaultValue={lineup?.slug ?? ""} className="admin-input" />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Карта</span>
          <select name="mapId" required defaultValue={lineup?.mapId ?? ""} className="admin-input">
            <option value="">Выберите карту</option>
            {maps.map((map) => (
              <option key={map.id} value={map.id}>
                {map.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Тип гранаты</span>
          <select name="utilityType" defaultValue={(lineup?.utilityType as UtilityType | undefined) ?? "smoke"} className="admin-input">
            <option value="smoke">{formatUtilityTypeRu("smoke")}</option>
            <option value="flash">{formatUtilityTypeRu("flash")}</option>
            <option value="molotov">{formatUtilityTypeRu("molotov")}</option>
            <option value="he">{formatUtilityTypeRu("he")}</option>
            <option value="oneway">{formatUtilityTypeRu("oneway")}</option>
            <option value="unknown">{formatUtilityTypeRu("unknown")}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Сторона</span>
          <select name="side" defaultValue={(lineup?.side as Side | undefined) ?? "unknown"} className="admin-input">
            <option value="t">T</option>
            <option value="ct">CT</option>
            <option value="both">{formatSideRu("both")}</option>
            <option value="unknown">{formatSideRu("unknown")}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Сложность</span>
          <select name="difficulty" defaultValue={(lineup?.difficulty as Difficulty | undefined) ?? "unknown"} className="admin-input">
            <option value="easy">{formatDifficultyRu("easy")}</option>
            <option value="medium">{formatDifficultyRu("medium")}</option>
            <option value="hard">{formatDifficultyRu("hard")}</option>
            <option value="unknown">{formatDifficultyRu("unknown")}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Статус</span>
          <select name="status" defaultValue={(lineup?.status as LineupStatus | undefined) ?? "published"} className="admin-input">
            <option value="draft">{formatStatusRu("draft")}</option>
            <option value="pending_review">{formatStatusRu("pending_review")}</option>
            <option value="published">{formatStatusRu("published")}</option>
            <option value="rejected">{formatStatusRu("rejected")}</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Зона</span>
          <input name="area" defaultValue={lineup?.area ?? ""} className="admin-input" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Тип броска</span>
          <input name="throwType" defaultValue={lineup?.throwType ?? ""} className="admin-input" />
          <span className="block text-xs text-slate-500">Например: {formatThrowTypeRu("left-click")}, {formatThrowTypeRu("right-click")}, Jumpthrow</span>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Откуда</span>
          <input name="fromPosition" defaultValue={lineup?.fromPosition ?? ""} className="admin-input" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Куда</span>
          <input name="targetPosition" defaultValue={lineup?.targetPosition ?? ""} className="admin-input" />
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="text-slate-400">Описание</span>
        <textarea name="description" defaultValue={lineup?.description ?? ""} rows={4} className="admin-input min-h-[8rem]" />
      </label>
      <label className="space-y-2 text-sm">
        <span className="text-slate-400">Шаги: строки или JSON-массив step-объектов</span>
        <textarea name="steps" defaultValue={jsonStepsToText(lineup?.steps)} rows={5} className="admin-input min-h-[9rem]" />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Теги, по одной строке</span>
          <textarea name="tags" defaultValue={lineup?.tags.join("\n") ?? ""} rows={4} className="admin-input min-h-[8rem]" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Алиасы, по одной строке</span>
          <textarea name="aliases" defaultValue={lineup?.aliases.join("\n") ?? ""} rows={4} className="admin-input min-h-[8rem]" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">URL видео</span>
          <input name="videoUrl" defaultValue={lineup?.videoUrl ?? ""} className="admin-input" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">URL превью</span>
          <input name="previewImageUrl" defaultValue={lineup?.previewImageUrl ?? ""} className="admin-input" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">URL картинки прицела</span>
          <input name="aimImageUrl" defaultValue={lineup?.aimImageUrl ?? ""} className="admin-input" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">URL картинки позиции</span>
          <input name="positionImageUrl" defaultValue={lineup?.positionImageUrl ?? ""} className="admin-input" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Название источника</span>
          <input name="sourceName" defaultValue={lineup?.sourceName ?? ""} className="admin-input" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">URL источника</span>
          <input name="sourceUrl" defaultValue={lineup?.sourceUrl ?? ""} className="admin-input" />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input type="checkbox" name="isVerified" defaultChecked={lineup?.isVerified ?? false} className="h-5 w-5 rounded border-white/20 bg-slate-900" />
        Проверено
      </label>

      <button type="submit" className="admin-button">
        {lineup ? "Сохранить раскид" : "Создать раскид"}
      </button>
    </form>
  );
}
