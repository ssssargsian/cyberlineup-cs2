import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-[linear-gradient(110deg,#111827,#172033,#111827)]", className)} />;
}
