"use client";

// next-themes 래퍼 — data-theme 속성으로 라이트/다크 전환
// 시안의 [data-theme="dark"] CSS 변수와 매칭되도록 attribute 옵션 사용
// ToastProvider 도 함께 마운트 해서 모든 admin/auth 페이지에서 useToast 사용 가능

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      themes={["light", "dark"]}
      disableTransitionOnChange
    >
      <ToastProvider>{children}</ToastProvider>
    </NextThemesProvider>
  );
}
