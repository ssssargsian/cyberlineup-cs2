export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-3xl border border-white/10 bg-white/5 ${className}`} />;
}
