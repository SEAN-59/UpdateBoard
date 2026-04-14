"use server";

// 로그인 server action — env 의 ADMIN_ID / ADMIN_PW_HASH 와 비교
// Phase 1 stub: 비밀번호 일치 시 세션 쿠키에 userId 저장 (서명 없음)
// Phase 3 (Phase 2 다음 단계) 에서 SESSION_SECRET 으로 서명/만료 처리 추가 예정

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { setSession } from "@/lib/auth/session";

export type LoginFormState = {
  ok: boolean;
  error?: string;
};

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
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
