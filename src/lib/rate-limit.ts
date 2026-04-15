// 인메모리 token bucket rate limiter
//
// 한계: 단일 프로세스 메모리에만 존재 — 다중 인스턴스 배포 시 카운터 공유 안 됨.
// 본 프로젝트는 NAS 에서 debug/release 각 1개 인스턴스로 동작하므로 충분.
// 필요 시 Phase 4 에서 Redis 또는 Durable Object 로 교체.

export type RateLimitOptions = {
  capacity: number; // 버킷 최대 토큰 수 (burst 허용량)
  refillPerSec: number; // 초당 회복되는 토큰 수
};

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

type Bucket = {
  tokens: number;
  lastRefill: number; // epoch ms
};

const BUCKETS_KEY = Symbol.for("__updateboard_rate_limit_buckets__");
type GlobalWithBuckets = typeof globalThis & {
  [BUCKETS_KEY]?: Map<string, Bucket>;
};

function getBuckets(): Map<string, Bucket> {
  const g = globalThis as GlobalWithBuckets;
  if (!g[BUCKETS_KEY]) {
    g[BUCKETS_KEY] = new Map();
  }
  return g[BUCKETS_KEY]!;
}

// 요청 1개를 소비. 통과하면 allowed=true, 막히면 retryAfterSec 제공.
export function consumeToken(key: string, options: RateLimitOptions): RateLimitResult {
  const buckets = getBuckets();
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: options.capacity, lastRefill: now };

  // 이전 호출 이후 경과 시간만큼 토큰 회복
  const elapsedSec = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(
    options.capacity,
    bucket.tokens + elapsedSec * options.refillPerSec,
  );
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    buckets.set(key, bucket);
    return { allowed: true };
  }

  buckets.set(key, bucket);
  // 다음 토큰이 생길 때까지 남은 초
  const retryAfterSec = Math.max(1, Math.ceil((1 - bucket.tokens) / options.refillPerSec));
  return { allowed: false, retryAfterSec };
}

// 특정 키의 버킷을 리셋 (테스트·관리자 이벤트용)
export function resetBucket(key: string): void {
  getBuckets().delete(key);
}

// 프리셋 — 호출부에서 바로 쓰기 좋게 하나로 모아둠
export const RATE_LIMITS = {
  // 로그인: IP 당 15분에 5회
  login: {
    capacity: 5,
    refillPerSec: 5 / (15 * 60), // 약 0.0056/sec, 15분마다 5 회복
  } satisfies RateLimitOptions,
  // 공개 API: 키 당 분당 60회 (= 1 req/sec 평균, 5 req burst 허용)
  publicApi: {
    capacity: 60,
    refillPerSec: 1,
  } satisfies RateLimitOptions,
} as const;
