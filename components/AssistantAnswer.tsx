import { Bot } from "lucide-react";

export function AssistantAnswer({
  answer,
  mode,
  resultCount
}: {
  answer?: string;
  mode?: "fallback" | "openai";
  resultCount?: number;
}) {
  if (!answer) {
    return null;
  }

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#0b0f18]/95 p-6 shadow-[0_22px_80px_rgba(0,0,0,0.3)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-400/25 bg-orange-500/10 text-orange-200">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-orange-200">Ассистент</div>
            <div className="text-lg font-black text-white">Ответ по базе</div>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          {typeof resultCount === "number" ? `Результатов: ${resultCount}` : null}
          {mode ? ` • режим: ${mode === "openai" ? "OpenAI" : "поиск по базе"}` : null}
        </div>
      </div>
      <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{answer}</pre>
    </div>
  );
}
