"use client";

// 키 발급 직후 한 번만 노출되는 배너 — query string 의 issued=<token> 사용
// 닫기 시 query string 만 제거 (페이지 다시 로드 안 함)

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export function IssuedBanner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("issued");
  const name = params.get("name");
  const [hidden, setHidden] = useState(false);
  const { showToast } = useToast();

  if (!token || hidden) return null;

  const handleClose = () => {
    setHidden(true);
    router.replace("/api-keys");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      showToast({ type: "success", title: "복사 완료", message: "토큰이 클립보드에 복사되었습니다." });
    } catch {
      showToast({ type: "danger", title: "복사 실패", message: "수동으로 복사해주세요." });
    }
  };

  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-success)]/40 bg-[var(--color-success-light)] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            새 API 키가 발급되었습니다
          </span>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
      <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
        {name && (
          <>
            <strong className="text-[var(--color-text-primary)]">{name}</strong> 키의 전체 토큰은{" "}
          </>
        )}
        <strong>지금만</strong> 확인할 수 있습니다. 이 창을 닫으면 다시는 조회할 수 없으니, 안전한 곳에 복사해 두세요.
      </p>
      <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
        <code className="flex-1 select-all break-all font-mono text-xs text-[var(--color-text-primary)]">
          {token}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
          title="복사"
          aria-label="토큰 복사"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
