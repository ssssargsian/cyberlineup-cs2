import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6 pb-16">
      <LoadingSkeleton className="h-52 rounded-[2.5rem]" />
      <div className="grid gap-5 lg:grid-cols-3">
        <LoadingSkeleton className="h-72 rounded-[2rem]" />
        <LoadingSkeleton className="h-72 rounded-[2rem]" />
        <LoadingSkeleton className="h-72 rounded-[2rem]" />
      </div>
    </div>
  );
}
