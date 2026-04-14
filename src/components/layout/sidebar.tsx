// 좌측 고정 사이드바 — 시안 dashboard.html 의 .sidebar 패턴
// 메뉴 active 표시는 client component (NavLink) 에 위임

import Link from "next/link";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

const ADMIN_NAME = "Sean Kim";
const ADMIN_EMAIL = "ksg3452@gmail.com";

const NAV_ITEMS = [
  {
    href: "/",
    label: "대시보드",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/apps",
    label: "앱 관리",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <line x1="4" y1="10" x2="20" y2="10" />
        <line x1="10" y1="4" x2="10" y2="20" />
      </svg>
    ),
  },
  {
    href: "/api-keys",
    label: "API 키",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
  },
  {
    href: "/api-docs",
    label: "API 문서",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="9" y1="7" x2="15" y2="7" />
        <line x1="9" y1="11" x2="15" y2="11" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const initial = ADMIN_NAME.charAt(0).toUpperCase();

  return (
    <aside className="fixed left-0 top-0 z-[var(--z-sticky)] flex h-screen w-[var(--layout-sidebar-width)] flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)]">
      {/* Logo */}
      <div className="border-b border-[var(--color-border)] px-5 pt-6 pb-4">
        <Link href="/" className="block">
          <h2 className="text-sm font-bold tracking-tight text-[var(--color-text-primary)]">
            UpdateBoard
          </h2>
          <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
            Admin Console
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-4">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-disabled)]">
            메뉴
          </div>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="flex-shrink-0 border-t border-[var(--color-border)] p-3">
        <ThemeToggle />
        <div className="mt-3 flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] p-2 transition-colors hover:bg-[var(--color-bg-secondary)]">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-light)] text-xs font-semibold text-[var(--color-accent-text)]">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
              {ADMIN_NAME}
            </p>
            <span className="truncate text-[10px] text-[var(--color-text-muted)]">
              {ADMIN_EMAIL}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
