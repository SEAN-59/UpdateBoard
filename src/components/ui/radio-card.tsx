// RadioCard — 시안의 .card-radio 패턴
// 플랫폼 선택, 모드 선택 등에 사용
// Client/Server 양쪽에서 사용 가능 (순수 JSX)

"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type RadioCardProps = {
  name: string;
  value: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: string) => void;
  icon?: ReactNode;
  title: string;
  description?: string;
  required?: boolean;
};

export function RadioCard({
  name,
  value,
  checked,
  defaultChecked,
  onChange,
  icon,
  title,
  description,
  required,
}: RadioCardProps) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border bg-[var(--color-bg)] px-4 py-3 transition-all",
        checked
          ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]"
          : "border-[var(--color-border-strong)] hover:border-[var(--color-accent)]",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        required={required}
        className="sr-only"
      />
      {icon && (
        <span
          className={cn(
            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors",
            checked
              ? "bg-[var(--color-accent)] text-white"
              : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] group-hover:bg-[var(--color-accent-light)] group-hover:text-[var(--color-accent)]",
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[var(--color-text-primary)]">{title}</div>
        {description && (
          <div className="text-xs text-[var(--color-text-muted)]">{description}</div>
        )}
      </div>
    </label>
  );
}
