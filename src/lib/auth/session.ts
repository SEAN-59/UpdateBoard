// HMAC-SHA256 으로 서명된 세션 쿠키
//
// 쿠키 포맷: `<base64url(payload)>.<base64url(hmac)>`
// payload = JSON { userId, exp }  (exp 는 epoch seconds)
//
// 변조 검증: 쿠키를 받을 때마다 payload 를 같은 SESSION_SECRET 으로 재서명해서
// 원래 서명과 일치하는지 timing-safe 로 비교한다. 불일치 / 만료 / 파싱 실패는
// 전부 null 반환 → admin layout 의 인증 가드가 /login 으로 redirect.
//
// Phase 2 에서 사용했던 SESSION_BYPASS dev 단축은 이 시점에 제거한다.

import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "ub_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 시간

export type Session = {
  userId: string;
};

type SessionPayload = {
  userId: string;
  exp: number; // epoch seconds
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET 환경변수가 설정되어 있지 않습니다.");
  }
  return secret;
}

function sign(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as SessionPayload).userId === "string" &&
      typeof (parsed as SessionPayload).exp === "number"
    ) {
      return parsed as SessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// 현재 요청의 세션을 반환. 쿠키가 없거나, 서명이 안 맞거나, 만료됐으면 null.
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const dotIndex = token.indexOf(".");
  if (dotIndex <= 0 || dotIndex === token.length - 1) return null;

  const encoded = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return null;
  }

  const expected = sign(encoded, secret);
  if (!timingSafeEqual(expected, signature)) return null;

  const payload = decodePayload(encoded);
  if (!payload) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp <= nowSec) return null;

  return { userId: payload.userId };
}

// 새 세션을 발급해서 쿠키에 심는다.
export async function setSession(userId: string): Promise<void> {
  const secret = getSecret();
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = encodePayload(payload);
  const signature = sign(encoded, secret);
  const token = `${encoded}.${signature}`;

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
