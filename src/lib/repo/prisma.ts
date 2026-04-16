// PrismaRepo — Repo 인터페이스의 Prisma + MariaDB 구현
// src/lib/repo/mock.ts 와 동일한 시그니처. 라우트 코드는 변경 없이 동작.

import bcrypt from "bcryptjs";
import type { App, AppVersion, ApiKey, Platform, VersionMode } from "@/lib/types";
import type {
  CreateAppInput,
  CreateApiKeyInput,
  CreateVersionInput,
  IssuedApiKey,
  Repo,
  UpdateAppInput,
  UpdateVersionInput,
} from "./interface";
import { getPrisma } from "./prisma-client";

const API_KEY_HASH_ROUNDS = 10;

function generateToken(): { full: string; prefix: string } {
  const random = Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join("");
  const full = `uk_live_${random}`;
  return { full, prefix: full.slice(0, 12) };
}

// Prisma 모델 → 도메인 타입 매핑. Prisma 의 enum 과 string 차이를 흡수.
function mapApp(row: {
  bundleId: string;
  name: string;
  platform: string;
  description: string | null;
  storeUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): App {
  return {
    bundleId: row.bundleId,
    name: row.name,
    platform: row.platform as Platform,
    description: row.description ?? undefined,
    storeUrl: row.storeUrl ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapVersion(row: {
  id: string;
  bundleId: string;
  mode: string;
  version: string;
  releaseNote: string;
  forceUpdate: boolean;
  isLatest: boolean;
  createdAt: Date;
}): AppVersion {
  return {
    id: row.id,
    bundleId: row.bundleId,
    mode: row.mode as VersionMode,
    version: row.version,
    releaseNote: row.releaseNote,
    forceUpdate: row.forceUpdate,
    isLatest: row.isLatest,
    createdAt: row.createdAt,
  };
}

function mapApiKey(row: {
  id: string;
  name: string;
  bundleId: string | null;
  tokenPrefix: string;
  tokenHash: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
}): ApiKey {
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

class PrismaRepo implements Repo {
  private get db() {
    return getPrisma();
  }

  async listApps(): Promise<App[]> {
    const rows = await this.db.app.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(mapApp);
  }

  async getApp(bundleId: string): Promise<App | null> {
    const row = await this.db.app.findUnique({ where: { bundleId } });
    return row ? mapApp(row) : null;
  }

  async createApp(input: CreateAppInput): Promise<App> {
    const existing = await this.db.app.findUnique({ where: { bundleId: input.bundleId } });
    if (existing) throw new Error(`이미 존재하는 bundleId: ${input.bundleId}`);
    const row = await this.db.app.create({
      data: {
        bundleId: input.bundleId,
        name: input.name,
        platform: input.platform,
        description: input.description,
        storeUrl: input.storeUrl,
      },
    });
    return mapApp(row);
  }

  async updateApp(bundleId: string, input: UpdateAppInput): Promise<App> {
    const row = await this.db.app.update({
      where: { bundleId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.platform !== undefined && { platform: input.platform }),
        ...(input.description !== undefined && { description: input.description }),
        // storeUrl: undefined 는 변경 없음, null 은 명시적 clear
        ...(input.storeUrl !== undefined && { storeUrl: input.storeUrl }),
      },
    });
    return mapApp(row);
  }

  async deleteApp(bundleId: string): Promise<void> {
    // cascade 는 Prisma schema 의 onDelete: Cascade 가 처리
    await this.db.app.delete({ where: { bundleId } });
  }

  async listVersions(bundleId: string): Promise<AppVersion[]> {
    const rows = await this.db.appVersion.findMany({
      where: { bundleId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapVersion);
  }

  async getVersion(versionId: string): Promise<AppVersion | null> {
    const row = await this.db.appVersion.findUnique({ where: { id: versionId } });
    return row ? mapVersion(row) : null;
  }

  async createVersion(input: CreateVersionInput): Promise<AppVersion> {
    const app = await this.db.app.findUnique({ where: { bundleId: input.bundleId } });
    if (!app) throw new Error(`존재하지 않는 bundleId: ${input.bundleId}`);

    // 같은 (bundleId, mode) 의 기존 latest 해제 — isLatest=true 인 경우만
    return await this.db.$transaction(async (tx) => {
      if (input.isLatest) {
        await tx.appVersion.updateMany({
          where: { bundleId: input.bundleId, mode: input.mode, isLatest: true },
          data: { isLatest: false },
        });
      }
      const row = await tx.appVersion.create({
        data: {
          bundleId: input.bundleId,
          mode: input.mode,
          version: input.version,
          releaseNote: input.releaseNote,
          forceUpdate: input.forceUpdate,
          isLatest: input.isLatest,
        },
      });
      return mapVersion(row);
    });
  }

  async updateVersion(versionId: string, input: UpdateVersionInput): Promise<AppVersion> {
    const existing = await this.db.appVersion.findUnique({ where: { id: versionId } });
    if (!existing) throw new Error(`존재하지 않는 versionId: ${versionId}`);

    return await this.db.$transaction(async (tx) => {
      if (input.isLatest === true) {
        await tx.appVersion.updateMany({
          where: {
            bundleId: existing.bundleId,
            mode: existing.mode,
            isLatest: true,
            NOT: { id: versionId },
          },
          data: { isLatest: false },
        });
      }
      const row = await tx.appVersion.update({
        where: { id: versionId },
        data: {
          ...(input.releaseNote !== undefined && { releaseNote: input.releaseNote }),
          ...(input.forceUpdate !== undefined && { forceUpdate: input.forceUpdate }),
          ...(input.isLatest !== undefined && { isLatest: input.isLatest }),
        },
      });
      return mapVersion(row);
    });
  }

  async deleteVersion(versionId: string): Promise<void> {
    await this.db.appVersion.delete({ where: { id: versionId } });
  }

  async listApiKeys(): Promise<ApiKey[]> {
    const rows = await this.db.apiKey.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(mapApiKey);
  }

  async createApiKey(input: CreateApiKeyInput): Promise<IssuedApiKey> {
    const { full, prefix } = generateToken();
    const hash = await bcrypt.hash(full, API_KEY_HASH_ROUNDS);
    const row = await this.db.apiKey.create({
      data: {
        name: input.name,
        bundleId: input.bundleId,
        tokenPrefix: prefix,
        tokenHash: hash,
      },
    });
    return { apiKey: mapApiKey(row), fullToken: full };
  }

  async revokeApiKey(id: string): Promise<void> {
    await this.db.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async countSummary() {
    const [apps, versions, apiKeysActive, apiKeysRevoked] = await Promise.all([
      this.db.app.count(),
      this.db.appVersion.count(),
      this.db.apiKey.count({ where: { revokedAt: null } }),
      this.db.apiKey.count({ where: { revokedAt: { not: null } } }),
    ]);
    return { apps, versions, apiKeysActive, apiKeysRevoked };
  }

  async recentVersions(limit: number): Promise<AppVersion[]> {
    const rows = await this.db.appVersion.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(mapVersion);
  }
}

export const prismaRepo = new PrismaRepo();
