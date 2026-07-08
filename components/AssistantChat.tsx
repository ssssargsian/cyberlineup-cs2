"use client";

import { SendHorizonal, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";

import { AssistantAnswer } from "@/components/AssistantAnswer";
import { LineupCard } from "@/components/LineupCard";

type AssistantPayload = {
  answer: string;
  mode: "fallback" | "openai";
  intent: {
    map?: string;
    utilityType?: string;
    area?: string;
    side?: string;
  };
  results: Array<any>;
};

export function AssistantChat() {
  const [query, setQuery] = useState("Что кинуть на выход Б даст?");
  const [response, setResponse] = useState<AssistantPayload | null>(null);
  const [isPending, startTransition] = useTransition();
  const suggestions = ["смок б даст", "молик банан инферно", "flash mid mirage"];

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-white/10 bg-[#0b0f18]/95 p-4 shadow-[0_22px_80px_rgba(0,0,0,0.32)] sm:p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-400/10"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
              {suggestion}
            </button>
          ))}
        </div>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const apiResponse = await fetch("/api/assistant", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ query })
              });

              const data = await apiResponse.json();
              setResponse(data);
            });
          }}
        >
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            rows={3}
            className="min-h-[7rem] flex-1 rounded-2xl border border-white/10 bg-[#05070d]/80 px-5 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400/45"
            placeholder="Что кинуть на выход Б даст?"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-400/40 bg-gradient-to-r from-[#ff5500] via-[#f97316] to-[#f59e0b] px-6 py-4 text-sm font-black text-white shadow-[0_0_30px_rgba(255,85,0,0.24)] transition hover:border-orange-300/60"
          >
            <SendHorizonal className="h-4 w-4" />
            {isPending ? "Ищу..." : "Спросить"}
          </button>
        </form>
      </div>

      {response ? (
        <>
          <AssistantAnswer answer={response.answer} mode={response.mode} resultCount={response.results.length} />
          {response.results.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {response.results.map((lineup) => (
                <LineupCard key={lineup.id} lineup={lineup} />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
