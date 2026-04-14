// SummaryCard — dashboard.html 의 .summary-card 패턴

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "accent" | "success" | "info";

const ICON_TONE: Record<Tone, string> = {
  accent: "bg-[var(--color-accent-light)] text-[var(--color-accent)]",
  success: "bg-[var(--color-success-light)] text-[var(--color-success)]",
  info: "bg-[var(--color-info-light)] text-[var(--color-info)]",
};

type SummaryCardProps = {
  label: string;
  value: number | string;
  sub?: string;
  icon: ReactNode;
  tone?: Tone;
};

export function SummaryCard({ label, value, sub, icon, tone = "accent" }: SummaryCardProps) {
  return (
    <div className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[var(--shadow-xs)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]",
            ICON_TONE[tone],
          )}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold leading-none tracking-tight text-[var(--color-text-primary)]">
        {value}
      </div>
      {sub && <p className="mt-2 text-xs text-[var(--color-text-muted)]">{sub}</p>}
    </div>
  );
}
