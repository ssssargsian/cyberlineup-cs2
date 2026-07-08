import { cn } from "@/lib/utils";

export function Section({
  label,
  title,
  description,
  children,
  className,
  action
}: {
  label?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {label ? <div className="tactical-label text-cyan-300">{label}</div> : null}
          <h2 className="section-title mt-2">{title}</h2>
          {description ? <p className="section-copy mt-3 max-w-2xl">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
