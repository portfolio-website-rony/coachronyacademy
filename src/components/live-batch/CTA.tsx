import type { ReactNode } from "react";

export function CTA({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-mont text-sm font-semibold tracking-tight transition";
  const styles =
    variant === "primary"
      ? "bg-gradient-primary text-background shadow-glow hover:opacity-90"
      : "border border-white/15 bg-white/[0.03] text-foreground hover:border-primary/40 hover:bg-white/[0.06]";
  return (
    <a href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </a>
  );
}
