"use client";

// 사이드바 하단 admin 정보 + 로그아웃 메뉴
// 호버 시 로그아웃 버튼 노출

import { useTransition } from "react";
import { logoutAction } from "@/lib/auth/actions";

type SidebarUserProps = {
  name: string;
  email: string;
};

export function SidebarUser({ name, email }: SidebarUserProps) {
  const initial = name.charAt(0).toUpperCase();
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    if (pending) return;
    if (!confirm("로그아웃 하시겠습니까?")) return;
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-md)] p-2">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-light)] text-xs font-semibold text-[var(--color-accent-text)]">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">{name}</p>
        <span className="truncate text-[10px] text-[var(--color-text-muted)]">{email}</span>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-danger)] disabled:opacity-40"
        aria-label="로그아웃"
        title="로그아웃"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}
