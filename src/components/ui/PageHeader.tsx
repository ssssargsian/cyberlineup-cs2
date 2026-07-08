import { cn } from "@/lib/utils";

export function PageHeader({
  label,
  title,
  description,
  children,
  className
}: {
  label?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("tactical-panel overflow-hidden p-6 sm:p-8", className)}>
      <div className="relative">
        {label ? <div className="tactical-label text-orange-200">{label}</div> : null}
        <h1 className="mt-3 max-w-5xl text-4xl font-black leading-[0.98] text-white sm:text-5xl lg:text-6xl">{title}</h1>
        {description ? <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{description}</p> : null}
        {children ? <div className="mt-7">{children}</div> : null}
      </div>
    </section>
  );
}
