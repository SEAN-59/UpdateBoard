// Table — 시안 .table-wrap 패턴

import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-xs)]",
        className,
      )}
    >
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="bg-[var(--color-bg-secondary)]">{children}</tr>
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { children: ReactNode }) {
  return (
    <tr
      {...props}
      className={cn(
        "transition-colors [&:not(:last-child)>td]:border-b [&>td]:border-[var(--color-border)] hover:[&>td]:bg-[var(--color-bg-secondary)]",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TH({
  children,
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <th
      {...props}
      className={cn(
        "border-b border-[var(--color-border)] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TD({
  children,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <td
      {...props}
      className={cn(
        "px-4 py-3 text-sm text-[var(--color-text-primary)]",
        className,
      )}
    >
      {children}
    </td>
  );
}
