// Input — 시안 .input 패턴

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-[var(--radius-md)] border bg-[var(--color-bg)] px-3 py-2 text-sm leading-normal text-[var(--color-text-primary)] outline-none transition-colors duration-150 placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-light)]",
        invalid
          ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:shadow-[0_0_0_3px_var(--color-danger-light)]"
          : "border-[var(--color-border-strong)]",
        className,
      )}
    />
  );
}
