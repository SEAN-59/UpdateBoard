// Breadcrumb — 시안 .breadcrumb 패턴

import Link from "next/link";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav
      className={cn(
        "mb-6 flex items-center gap-2 text-xs text-[var(--color-text-muted)]",
        className,
      )}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-[var(--color-text-primary)]"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-[var(--color-text-primary)]" : ""}>
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-[var(--color-text-disabled)]">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
