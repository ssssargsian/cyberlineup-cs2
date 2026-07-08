import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/10 bg-[#0b0f18]/90 shadow-[0_22px_80px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.03]",
        interactive && "transition duration-200 hover:-translate-y-1 hover:border-orange-400/35 hover:shadow-[0_28px_95px_rgba(255,85,0,0.12)]",
        className
      )}
      {...props}
    />
  );
}
