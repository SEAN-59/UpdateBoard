// Card — 시안 .card / .summary-card 공용 컨테이너

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: DivProps & { children: ReactNode }) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-xs)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: DivProps & { children: ReactNode }) {
  return (
    <div
      {...props}
      className={cn(
        "border-b border-[var(--color-border)] px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: DivProps & { children: ReactNode }) {
  return (
    <div {...props} className={cn("px-6 py-6", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: DivProps & { children: ReactNode }) {
  return (
    <div
      {...props}
      className={cn(
        "border-t border-[var(--color-border)] px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
