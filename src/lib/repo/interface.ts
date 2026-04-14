// Repository 인터페이스 — Phase 1 mock, Phase 2 Prisma 양쪽이 구현

import type { App, AppVersion, ApiKey, Platform, VersionMode } from "@/lib/types";

export type CreateAppInput = {
  bundleId: string;
  name: string;
  platform: Platform;
  description?: string;
};

export type UpdateAppInput = {
  name?: string;
  platform?: Platform;
  description?: string;
};

export type CreateVersionInput = {
  bundleId: string;
  mode: VersionMode;
  version: string;
  releaseNote: string;
  forceUpdate: boolean;
  isLatest: boolean;
};

export type UpdateVersionInput = {
  releaseNote?: string;
  forceUpdate?: boolean;
  isLatest?: boolean;
};

export type CreateApiKeyInput = {
  name: string;
  bundleId: string | null;
};

export type IssuedApiKey = {
  apiKey: ApiKey;
  fullToken: string; // 발급 직후 한 번만 노출
};

export interface Repo {
  // Apps
  listApps(): Promise<App[]>;
  getApp(bundleId: string): Promise<App | null>;
  createApp(input: CreateAppInput): Promise<App>;
  updateApp(bundleId: string, input: UpdateAppInput): Promise<App>;
  deleteApp(bundleId: string): Promise<void>;

  // Versions
  listVersions(bundleId: string): Promise<AppVersion[]>;
  getVersion(versionId: string): Promise<AppVersion | null>;
  createVersion(input: CreateVersionInput): Promise<AppVersion>;
  updateVersion(versionId: string, input: UpdateVersionInput): Promise<AppVersion>;
  deleteVersion(versionId: string): Promise<void>;

  // API Keys
  listApiKeys(): Promise<ApiKey[]>;
  createApiKey(input: CreateApiKeyInput): Promise<IssuedApiKey>;
  revokeApiKey(id: string): Promise<void>;

  // 집계 (대시보드용)
  countSummary(): Promise<{
    apps: number;
    versions: number;
    apiKeysActive: number;
    apiKeysRevoked: number;
  }>;
  recentVersions(limit: number): Promise<AppVersion[]>;
}
