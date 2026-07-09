"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

import { trackGoal } from "@/src/lib/analytics";

type TrackedExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  goal: string;
  params?: Record<string, unknown>;
};

export function TrackedExternalLink({ children, goal, params, onClick, ...props }: TrackedExternalLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackGoal(goal, params);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
