// 공개 API 인증 — Authorization: Bearer <token> 헤더 검증
// PR 1 의 mockRepo / prismaRepo 와 독립적. Prisma client 를 직접 사용해서
// tokenPrefix 로 후보 키를 좁힌 뒤 bcrypt compare 로 최종 검증.

import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/repo/prisma-client";
import type { ApiKey } from "@/lib/types";

export class UnauthorizedError extends Error {
  constructor(message: string = "API key is missing or invalid.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

// Bearer 헤더에서 토큰 추출. 형식이 아니면 null.
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  return match ? match[1].trim() : null;
}

type ApiKeyRow = {
  id: string;
  name: string;
  bundleId: string | null;
  tokenPrefix: string;
  tokenHash: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
};

function toApiKey(row: ApiKeyRow): ApiKey {
  return {
    id: row.id,
    name: row.name,
    bundleId: row.bundleId,
    tokenPrefix: row.tokenPrefix,
    tokenHash: row.tokenHash,
    createdAt: row.createdAt,
    lastUsedAt: row.lastUsedAt,
    revokedAt: row.revokedAt,
  };
}

// lastUsedAt 업데이트 스로틀링 — 같은 키가 1분 안에 여러 번 호출되면 DB write skip
const LAST_USED_THROTTLE_MS = 60_000;

async function maybeUpdateLastUsed(key: ApiKeyRow): Promise<void> {
  const now = Date.now();
  const prev = key.lastUsedAt?.getTime() ?? 0;
  if (now - prev < LAST_USED_THROTTLE_MS) return;
  try {
    await getPrisma().apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    });
  } catch {
    // lastUsedAt 업데이트 실패해도 요청 자체는 막지 않음 (best-effort)
  }
}

// 요청에서 API 키를 검증한다. 성공 시 검증된 ApiKey 반환.
// requiredBundleId 가 주어지면 해당 앱에 스코프된 키 또는 전역 키만 허용.
export async function verifyApiKey(
  request: Request,
  requiredBundleId?: string,
): Promise<ApiKey> {
  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token) {
    throw new UnauthorizedError("Missing Authorization header.");
  }

  // Prefix 는 발급 시 앞 12자로 고정. 토큰에서도 앞 12자 뽑아 후보 lookup.
  const prefix = token.slice(0, 12);
  const candidates: ApiKeyRow[] = await getPrisma().apiKey.findMany({
    where: {
      tokenPrefix: prefix,
      revokedAt: null,
    },
  });

  for (const candidate of candidates) {
    const matches = await bcrypt.compare(token, candidate.tokenHash);
    if (!matches) continue;

    // 스코프 검증: requiredBundleId 가 있으면 전역 키 (null) 이거나 같은 bundleId 여야 함
    if (
      requiredBundleId !== undefined &&
      candidate.bundleId !== null &&
      candidate.bundleId !== requiredBundleId
    ) {
      throw new UnauthorizedError("API key is not authorized for this app.");
    }

    // best-effort lastUsedAt 갱신
    void maybeUpdateLastUsed(candidate);
    return toApiKey(candidate);
  }

  throw new UnauthorizedError();
}
