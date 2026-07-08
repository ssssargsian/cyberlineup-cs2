import Link from "next/link";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-orange-400/40 bg-gradient-to-r from-[#ff5500] via-[#f97316] to-[#f59e0b] text-white shadow-[0_0_28px_rgba(255,85,0,0.22)] hover:border-orange-300/60 hover:shadow-[0_0_38px_rgba(255,85,0,0.34)]",
  secondary:
    "border-cyan-300/25 bg-cyan-400/[0.08] text-cyan-100 hover:border-cyan-300/45 hover:bg-cyan-400/[0.14] hover:shadow-[0_0_28px_rgba(34,211,238,0.14)]",
  ghost: "border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/18 hover:bg-white/[0.07]",
  danger: "border-red-400/25 bg-red-500/10 text-red-100 hover:border-red-300/40 hover:bg-red-500/15"
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-55";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={cn(baseClasses, variantClasses[variant], className)} {...props} />;
}

export function ButtonLink({ variant = "primary", className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(baseClasses, variantClasses[variant], className)} {...props}>
      {children}
    </Link>
  );
}
