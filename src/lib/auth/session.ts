// Phase 1 stub 세션 — 쿠키 존재 여부만 검사
// Phase 2 에서 SESSION_SECRET 으로 서명/검증/만료 처리 추가 예정

import { cookies } from "next/headers";

const SESSION_COOKIE = "ub_session";

export type Session = {
  userId: string;
};

// 현재 요청의 세션. 없으면 null.
// SESSION_BYPASS=1 이면 항상 로그인된 상태로 반환 (PR 1 단독 검증용 — login 페이지가
// 아직 없는 단계에서 admin 셸을 확인할 수 있도록).
export async function getSession(): Promise<Session | null> {
  if (process.env.SESSION_BYPASS === "1") {
    return { userId: process.env.ADMIN_ID ?? "admin" };
  }
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  return { userId: value };
}

// Phase 2 에서 서명된 토큰으로 교체 — 지금은 userId 그대로 저장
export async function setSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8시간
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
