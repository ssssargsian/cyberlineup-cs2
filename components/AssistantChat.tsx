"use client";

import { SendHorizonal } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-[2rem] p-4 sm:p-5">
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
            className="min-h-[7rem] flex-1 rounded-3xl border border-white/10 bg-slate-950/60 px-5 py-4 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Что кинуть на выход Б даст?"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-950"
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
