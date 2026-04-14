// 로그인 페이지 — login.html 시안 패턴 (사이드바 없는 풀스크린 카드)
// 이미 세션이 있으면 / 로 redirect

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-10 shadow-[var(--shadow-lg)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-accent)] text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">UpdateBoard</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">관리자 계정으로 로그인하세요</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
