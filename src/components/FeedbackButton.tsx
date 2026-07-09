"use client";

import { MessageSquarePlus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { FeedbackModal } from "@/src/components/FeedbackModal";
import { trackGoal } from "@/src/lib/analytics";

function getSlug(pathname: string, prefix: string) {
  return pathname.startsWith(prefix) ? decodeURIComponent(pathname.replace(prefix, "").split("/")[0] ?? "") : "";
}

export function FeedbackButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const lineupSlug = getSlug(pathname, "/lineups/");
  const mapSlug = getSlug(pathname, "/maps/");
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    function openFromEvent() {
      if (isAdmin) {
        return;
      }

      const currentUrl = typeof window !== "undefined" ? window.location.href : pathname;
      trackGoal("feedback_open", { currentUrl, lineupSlug, mapSlug });
      setIsOpen(true);
    }

    window.addEventListener("cyberlineup:open-feedback", openFromEvent);
    return () => window.removeEventListener("cyberlineup:open-feedback", openFromEvent);
  }, [isAdmin, lineupSlug, mapSlug, pathname]);

  if (isAdmin) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const currentUrl = typeof window !== "undefined" ? window.location.href : pathname;
          trackGoal("feedback_open", { currentUrl, lineupSlug, mapSlug });
          setIsOpen(true);
        }}
        className="fixed bottom-24 right-3 z-40 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-[#0b0f18]/95 px-4 py-3 text-sm font-extrabold text-cyan-100 shadow-[0_18px_60px_rgba(0,0,0,0.36)] backdrop-blur transition hover:border-orange-300/35 hover:text-white sm:bottom-5 sm:right-5"
      >
        <MessageSquarePlus className="h-4 w-4" />
        Предложить
      </button>
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} pathname={pathname} />
    </>
  );
}
