export type ExternalLineupVideo = {
  externalVideoUrl: string;
  sourceUrl?: string;
  sourceName?: string;
  credit?: string;
};

// TODO: перенести эти поля в БД, когда появится стабильная moderation-форма для внешних видео.
// Не скачиваем чужие видео, не удаляем watermark и всегда показываем источник.
export const externalLineupVideos: Record<string, ExternalLineupVideo> = {};

export function getExternalLineupVideo(slug: string) {
  return externalLineupVideos[slug] ?? null;
}
