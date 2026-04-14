// EmptyState — 시안 .empty-state 패턴

import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-16 text-center">
      <p className="text-base font-semibold text-[var(--color-text-primary)]">{title}</p>
      {description && (
        <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
