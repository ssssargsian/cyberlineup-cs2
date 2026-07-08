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
    <div className="glass-card rounded-[2rem] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">Ассистент</div>
            <div className="text-lg font-semibold text-white">Ответ по базе</div>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          {typeof resultCount === "number" ? `Результатов: ${resultCount}` : null}
          {mode ? ` • режим: ${mode === "openai" ? "OpenAI" : "fallback"}` : null}
        </div>
      </div>
      <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{answer}</pre>
    </div>
  );
}
