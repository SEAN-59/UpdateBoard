// UpdateBoard 도메인 타입 — Phase 1 mock repository 와 향후 Prisma 양쪽이 공유

export type Platform = "ios" | "android" | "web" | "desktop";
export type VersionMode = "debug" | "release";

export type App = {
  bundleId: string;
  name: string;
  platform: Platform;
  description?: string;
  storeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AppVersion = {
  id: string;
  bundleId: string;
  mode: VersionMode;
  version: string; // SemVer 문자열
  releaseNote: string;
  forceUpdate: boolean; // true 면 이 버전이 최소 지원선
  isLatest: boolean; // (bundleId, mode) 당 1개
  createdAt: Date;
};

export type ApiKey = {
  id: string;
  name: string;
  bundleId: string | null; // null = 전역 키
  tokenPrefix: string; // UI 표시용 앞 자리
  tokenHash: string; // Phase 1 은 plain 저장 OK
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
};
