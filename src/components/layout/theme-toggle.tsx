"use client";

// 사이드바 하단에 배치되는 다크모드 토글 버튼

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // SSR/CSR 불일치 방지 — 마운트 후에만 현재 테마 반영
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
      aria-label="다크모드 토글"
    >
      <span aria-hidden>{isDark ? "☀️" : "🌙"}</span>
      <span className="flex-1 text-left">{isDark ? "라이트모드" : "다크모드"}</span>
    </button>
  );
}
