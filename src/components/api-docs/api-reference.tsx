"use client";

// Scalar API Reference 클라이언트 래퍼
// Scalar 컴포넌트는 브라우저에서 인터랙티브 동작을 하므로 'use client' 필요

import { ApiReferenceReact } from "@scalar/api-reference-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import "@scalar/api-reference-react/style.css";

type ApiReferenceProps = {
  // OpenAPI 3.x 스펙 객체. src/lib/openapi.ts 에서 import 해서 그대로 전달.
  spec: object;
};

export function ApiReference({ spec }: ApiReferenceProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // SSR/CSR 테마 불일치 방지 — 마운트 후에만 현재 테마 반영
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 마운트 전에는 빈 상자만 그려서 hydration mismatch 방지
    return <div className="min-h-[600px]" />;
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-xs)] overflow-hidden">
      <ApiReferenceReact
        configuration={{
          content: spec,
          darkMode: resolvedTheme === "dark",
          theme: "default",
          layout: "modern",
          hideClientButton: true,
          showSidebar: true,
        }}
      />
    </div>
  );
}
