// 공개 클라이언트 API — 특정 bundleId 의 스토어 URL 조회
// OpenAPI 명세: docs 페이지 (/api-docs) 의 `AppStoreInfo` 스키마와 일치
// 인증: Authorization: Bearer <api-key>
// Rate limit: 인증 성공 시 API 키 ID 기준, 실패/익명 요청은 IP 기준
//
// 링크 미설정 시 200 + storeUrl: null (클라이언트가 "스토어 버튼 숨김" 으로 처리)
// 알 수 없는 bundleId 는 404

import { NextResponse } from "next/server";
import { UnauthorizedError, verifyApiKey } from "@/lib/api/auth";
import { consumeToken, RATE_LIMITS } from "@/lib/rate-limit";
import { getRepo } from "@/lib/repo";

type RouteParams = {
  params: Promise<{ bundleId: string }>;
};

type ErrorBody = {
  error: string;
  message: string;
};

function errorResponse(
  status: number,
  error: string,
  message: string,
  extraHeaders?: Record<string, string>,
): NextResponse<ErrorBody> {
  return NextResponse.json({ error, message }, { status, headers: extraHeaders });
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export async function GET(request: Request, { params }: RouteParams) {
  const { bundleId: rawBundleId } = await params;
  const bundleId = decodeURIComponent(rawBundleId);

  // 인증 — 실패해도 아래서 rate limit 을 먼저 IP 기준으로 돌린다
  let authedKeyId: string | null = null;
  let authError: UnauthorizedError | null = null;
  try {
    const key = await verifyApiKey(request, bundleId);
    authedKeyId = key.id;
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      authError = e;
    } else {
      throw e;
    }
  }

  // Rate limit — 키가 확인되면 키 ID 기준, 아니면 IP 기준
  const rateKey = authedKeyId
    ? `api:key:${authedKeyId}`
    : `api:ip:${getClientIp(request)}`;
  const rateCheck = consumeToken(rateKey, RATE_LIMITS.publicApi);
  if (!rateCheck.allowed) {
    return errorResponse(
      429,
      "rate_limited",
      `Too many requests. Retry after ${rateCheck.retryAfterSec} seconds.`,
      { "Retry-After": String(rateCheck.retryAfterSec) },
    );
  }

  if (authError) {
    return errorResponse(401, "unauthorized", authError.message);
  }

  const repo = getRepo();
  const app = await repo.getApp(bundleId);
  if (!app) {
    return errorResponse(404, "not_found", `App with bundleId '${bundleId}' does not exist.`);
  }

  return NextResponse.json({
    bundleId: app.bundleId,
    platform: app.platform,
    storeUrl: app.storeUrl ?? null,
  });
}
