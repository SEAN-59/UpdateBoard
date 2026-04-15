"use server";

// 로그인 server action — env 의 ADMIN_ID / ADMIN_PW_HASH 와 bcrypt 비교
// + 서명된 세션 쿠키 발급 + IP 당 rate limit

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { setSession } from "@/lib/auth/session";
import { consumeToken, RATE_LIMITS } from "@/lib/rate-limit";

export type LoginFormState = {
  ok: boolean;
  error?: string;
};

// X-Forwarded-For / X-Real-IP / (fallback) unknown
async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    // 여러 IP 가 쉼표로 연결되어 올 수 있음 — 첫 번째가 원 클라이언트
    return forwarded.split(",")[0].trim();
  }
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  // Rate limit 은 제일 먼저 체크해서 brute-force 공격이 bcrypt 비교까지 가지 않게 한다
  const ip = await getClientIp();
  const rateCheck = consumeToken(`login:${ip}`, RATE_LIMITS.login);
  if (!rateCheck.allowed) {
    const minutes = Math.ceil(rateCheck.retryAfterSec / 60);
    return {
      ok: false,
      error: `로그인 시도가 너무 많습니다. 약 ${minutes}분 뒤에 다시 시도해주세요.`,
    };
  }

  const id = String(formData.get("id") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!id || !password) {
    return { ok: false, error: "아이디와 비밀번호를 모두 입력해주세요." };
  }

  const expectedId = process.env.ADMIN_ID;
  const expectedHash = process.env.ADMIN_PW_HASH;
  if (!expectedId || !expectedHash) {
    return {
      ok: false,
      error: "서버에 관리자 자격증명이 설정되어 있지 않습니다. (ADMIN_ID / ADMIN_PW_HASH)",
    };
  }

  if (id !== expectedId) {
    return { ok: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  const passwordOk = await bcrypt.compare(password, expectedHash);
  if (!passwordOk) {
    return { ok: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  await setSession(id);
  redirect("/");
}
