"use client";

import { Send, X } from "lucide-react";
import { useEffect, useState } from "react";

import { trackGoal } from "@/src/lib/analytics";

const feedbackTypes = [
  "Ошибка в раскидке",
  "Добавить раскидку",
  "Проблема с фото/видео",
  "Идея для сайта",
  "Другое"
];

function getSlug(pathname: string, prefix: string) {
  return pathname.startsWith(prefix) ? decodeURIComponent(pathname.replace(prefix, "").split("/")[0] ?? "") : "";
}

export function FeedbackModal({
  isOpen,
  onClose,
  pathname
}: {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : pathname;
  const lineupSlug = getSlug(pathname, "/lineups/");
  const mapSlug = getSlug(pathname, "/maps/");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border border-white/10 bg-[#0b0f18] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.7)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-orange-200">Feedback</div>
            <h2 className="mt-1 text-2xl font-black text-white">Предложить улучшение</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Сообщите об ошибке, идее или недостающей раскидке. Мы получим страницу автоматически.</p>
          </div>
          <button type="button" aria-label="Закрыть" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-orange-300/35">
            <X className="h-4 w-4" />
          </button>
        </div>

        {status === "success" ? (
          <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-5 text-sm leading-7 text-emerald-100">
            Спасибо! Мы получили сообщение.
          </div>
        ) : (
          <form
            className="mt-6 grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const formData = new FormData(form);
              const payload = {
                type: String(formData.get("type") ?? ""),
                message: String(formData.get("message") ?? ""),
                contact: String(formData.get("contact") ?? ""),
                currentUrl,
                lineupSlug,
                mapSlug,
                userAgent: navigator.userAgent,
                website: String(formData.get("website") ?? "")
              };

              setStatus("loading");
              setError("");
              trackGoal("feedback_submit", { type: payload.type, currentUrl, lineupSlug, mapSlug });

              try {
                const response = await fetch("/api/feedback", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload)
                });
                const result = (await response.json().catch(() => null)) as { error?: string } | null;

                if (!response.ok) {
                  throw new Error(result?.error ?? "Не удалось отправить.");
                }

                setStatus("success");
                form.reset();
              } catch (submitError) {
                setStatus("error");
                setError(submitError instanceof Error ? submitError.message : "Не удалось отправить. Попробуйте позже.");
              }
            }}
          >
            <input tabIndex={-1} autoComplete="off" name="website" className="hidden" aria-hidden="true" />
            <label className="grid gap-2 text-sm text-slate-300">
              Тип
              <select name="type" className="admin-input" defaultValue={feedbackTypes[0]}>
                {feedbackTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm text-slate-300">
              Сообщение
              <textarea name="message" required minLength={5} maxLength={2000} rows={5} className="admin-input min-h-32 resize-y" placeholder="Опишите, что поправить или добавить..." />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">
              Контакт
              <input name="contact" maxLength={160} className="admin-input" placeholder="Telegram или email, если нужен ответ" />
            </label>
            {status === "error" ? <div className="rounded-xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error || "Не удалось отправить. Попробуйте позже."}</div> : null}
            <button type="submit" disabled={status === "loading"} className="admin-button disabled:cursor-not-allowed disabled:opacity-60">
              <Send className="mr-2 h-4 w-4" />
              {status === "loading" ? "Отправляем..." : "Отправить"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
