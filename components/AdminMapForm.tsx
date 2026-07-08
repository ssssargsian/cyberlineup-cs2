import type { Map } from "@prisma/client";

export function AdminMapForm({
  action,
  map
}: {
  action: (formData: FormData) => void | Promise<void>;
  map?: Map | null;
}) {
  return (
    <form action={action} className="glass-card space-y-5 rounded-[2rem] p-6">
      {map ? <input type="hidden" name="id" value={map.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Название карты</span>
          <input name="name" required defaultValue={map?.name ?? ""} className="admin-input" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-400">Slug</span>
          <input name="slug" required defaultValue={map?.slug ?? ""} className="admin-input" />
        </label>
      </div>
      <label className="space-y-2 text-sm">
        <span className="text-slate-400">Описание</span>
        <textarea name="description" defaultValue={map?.description ?? ""} rows={4} className="admin-input min-h-[7rem]" />
      </label>
      <label className="space-y-2 text-sm">
        <span className="text-slate-400">URL изображения</span>
        <input name="imageUrl" defaultValue={map?.imageUrl ?? ""} className="admin-input" />
      </label>
      <button type="submit" className="admin-button">
        {map ? "Сохранить карту" : "Создать карту"}
      </button>
    </form>
  );
}
