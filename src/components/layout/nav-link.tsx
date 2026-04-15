"use client";

// 사이드바 메뉴 항목 — 현재 경로와 비교해 active 표시

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
};

export function NavLink({ href, label, icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "mb-px flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-[var(--color-accent-light)] font-medium text-[var(--color-accent)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]",
      )}
    >
      <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">{icon}</span>
      {label}
    </Link>
  );
}
