"use client";

declare global {
  interface Window {
    ym?: (counterId: number, method: "reachGoal", goal: string, params?: Record<string, unknown>) => void;
  }
}

export function trackGoal(goal: string, params?: Record<string, unknown>) {
  const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

  if (typeof window === "undefined" || !metrikaId || !window.ym) {
    return;
  }

  const counterId = Number(metrikaId);

  if (!Number.isFinite(counterId)) {
    return;
  }

  try {
    window.ym(counterId, "reachGoal", goal, params);
  } catch {
    // Analytics must never break the product flow.
  }
}
