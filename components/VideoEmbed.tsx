import { PlayCircle } from "lucide-react";

function toEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
    }

    return url;
  } catch {
    return url;
  }
}

export function VideoEmbed({ url }: { url?: string | null }) {
  if (!url) {
    return (
      <div className="glass-card flex min-h-[18rem] items-center justify-center p-6 text-center text-sm text-slate-400">
        <div>
          <PlayCircle className="mx-auto mb-3 h-10 w-10 text-slate-500" />
          Видео пока не добавлено. Для draft-импорта это нормальное состояние.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <iframe
        title="Видео раскида"
        src={toEmbedUrl(url)}
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
