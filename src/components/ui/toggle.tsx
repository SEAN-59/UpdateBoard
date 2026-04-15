// Toggle — 시안의 토글 스위치 패턴
// hidden checkbox 위에 시각적 슬라이더

"use client";

import { cn } from "@/lib/utils";

type ToggleProps = {
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
};

export function Toggle({
  name,
  checked,
  defaultChecked,
  onChange,
  disabled,
  label,
  description,
}: ToggleProps) {
  return (
    <label
      className={cn(
        "flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <div className="min-w-0 flex-1">
        {label && (
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{label}</div>
        )}
        {description && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>
      <div className="relative inline-flex flex-shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="block h-6 w-11 rounded-full bg-[var(--color-bg-tertiary)] transition-colors peer-checked:bg-[var(--color-accent)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
        />
      </div>
    </label>
  );
}
