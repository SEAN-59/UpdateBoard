// Button — 시안 .btn 패턴 (primary/secondary/ghost/danger × sm/md/lg)

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white border-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] hover:border-[var(--color-accent-hover)]",
  secondary:
    "bg-[var(--color-bg)] text-[var(--color-text-primary)] border-[var(--color-border-strong)] hover:bg-[var(--color-bg-secondary)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] border-transparent hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]",
  danger:
    "bg-[var(--color-danger)] text-white border-[var(--color-danger)] hover:opacity-90",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-[calc(var(--space-2)+2px)] text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border font-medium leading-none transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
    >
      {children}
    </button>
  );
}
