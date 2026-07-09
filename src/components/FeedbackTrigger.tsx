"use client";

import { MessageSquarePlus } from "lucide-react";

import { trackGoal } from "@/src/lib/analytics";

export function FeedbackTrigger({
  currentUrl,
  lineupSlug,
  mapSlug,
  className
}: {
  currentUrl: string;
  lineupSlug?: string;
  mapSlug?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        trackGoal("feedback_open", { currentUrl, lineupSlug, mapSlug });
        window.dispatchEvent(new Event("cyberlineup:open-feedback"));
      }}
      className={className}
    >
      <MessageSquarePlus className="h-4 w-4" />
      Предложить правку
    </button>
  );
}
