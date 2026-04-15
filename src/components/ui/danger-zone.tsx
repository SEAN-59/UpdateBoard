// DangerZone — 시안의 .danger-zone 패턴
// 삭제·취소 등 되돌릴 수 없는 작업을 시각적으로 분리

import type { ReactNode } from "react";

type DangerZoneProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export function DangerZone({
  title = "위험 작업",
  description,
  children,
}: DangerZoneProps) {
  return (
    <div className="mt-10 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/40 bg-[var(--color-danger-light)] p-6">
      <h3 className="text-base font-semibold text-[var(--color-danger)]">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </div>
  );
}
