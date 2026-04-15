// 공개 클라이언트 API — 특정 bundleId 의 latest + min 버전 조회
// OpenAPI 명세: docs 페이지 (/api-docs) 의 `VersionInfo` 스키마와 일치
// 인증: Authorization: Bearer <api-key>

import { NextResponse } from "next/server";
import { UnauthorizedError, verifyApiKey } from "@/lib/api/auth";
import { getRepo } from "@/lib/repo";
import type { VersionMode } from "@/lib/types";
import { effectiveMinSupported } from "@/lib/version";

type RouteParams = {
  params: Promise<{ bundleId: string }>;
};

type ErrorBody = {
  error: string;
  message: string;
};

function errorResponse(status: number, error: string, message: string): NextResponse<ErrorBody> {
  return NextResponse.json({ error, message }, { status });
}

export async function GET(request: Request, { params }: RouteParams) {
  const { bundleId: rawBundleId } = await params;
  const bundleId = decodeURIComponent(rawBundleId);
  const { searchParams } = new URL(request.url);
  const modeParam = searchParams.get("mode");

  // mode 쿼리 검증
  if (modeParam !== "release" && modeParam !== "debug") {
    return errorResponse(
      400,
      "bad_request",
      "Query parameter `mode` is required and must be 'release' or 'debug'.",
    );
  }
  const mode: VersionMode = modeParam;

  // 인증
  try {
    await verifyApiKey(request, bundleId);
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return errorResponse(401, "unauthorized", e.message);
    }
    throw e;
  }

  const repo = getRepo();
  const app = await repo.getApp(bundleId);
  if (!app) {
    return errorResponse(404, "not_found", `App with bundleId '${bundleId}' does not exist.`);
  }

  const allVersions = await repo.listVersions(bundleId);
  const modeVersions = allVersions.filter((v) => v.mode === mode);
  if (modeVersions.length === 0) {
    return errorResponse(
      404,
      "not_found",
      `No '${mode}' versions found for '${bundleId}'.`,
    );
  }

  const latest = modeVersions.find((v) => v.isLatest);
  if (!latest) {
    return errorResponse(
      404,
      "not_found",
      `No latest '${mode}' version set for '${bundleId}'.`,
    );
  }

  const minSupported = effectiveMinSupported(modeVersions);

  return NextResponse.json({
    bundleId,
    mode,
    latest: latest.version,
    min: minSupported?.version ?? null,
    releaseNote: latest.releaseNote,
  });
}
