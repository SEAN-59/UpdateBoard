// Badge — 시안 .badge 패턴 (accent/success/warning/danger/neutral/info)

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "accent" | "success" | "warning" | "danger" | "neutral" | "info";

const VARIANT_CLASSES: Record<Variant, string> = {
  accent: "bg-[var(--color-accent-light)] text-[var(--color-accent-text)]",
  success: "bg-[var(--color-success-light)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
  info: "bg-[var(--color-info-light)] text-[var(--color-info)]",
  neutral: "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]",
};

export function Badge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-[2px] text-xs font-medium leading-[1.4]",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
