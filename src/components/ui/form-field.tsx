// FormField — label + 본문 + hint/error 묶음

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("mb-5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
          {required && <span className="ml-0.5 text-[var(--color-danger)]">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 pl-3 text-xs text-[var(--color-danger)]">{error}</p>
      ) : hint ? (
        <p className="mt-1 pl-3 text-xs text-[var(--color-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
