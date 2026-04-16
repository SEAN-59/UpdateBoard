// 인메모리 mock repository — Phase 1 데모용
// 프로세스 생애주기 동안만 유지. dev 핫리로드 시에도 유지되도록 globalThis 캐시.

import type { App, AppVersion, ApiKey } from "@/lib/types";
import type {
  CreateAppInput,
  CreateApiKeyInput,
  CreateVersionInput,
  IssuedApiKey,
  Repo,
  UpdateAppInput,
  UpdateVersionInput,
} from "./interface";

type Store = {
  apps: Map<string, App>;
  versions: Map<string, AppVersion>;
  apiKeys: Map<string, ApiKey>;
};

const STORE_KEY = Symbol.for("__updateboard_mock_store__");
type GlobalWithStore = typeof globalThis & { [STORE_KEY]?: Store };

function getStore(): Store {
  const g = globalThis as GlobalWithStore;
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = createSeed();
  }
  return g[STORE_KEY]!;
}

function createSeed(): Store {
  const apps = new Map<string, App>();
  const versions = new Map<string, AppVersion>();
  const apiKeys = new Map<string, ApiKey>();

  const now = new Date();

  // App 1 — Sample App (iOS)
  apps.set("com.updateboard.sample", {
    bundleId: "com.updateboard.sample",
    name: "Sample App",
    platform: "ios",
    description: "Phase 1 데모용 샘플 앱",
    createdAt: now,
    updatedAt: now,
  });

  const v1 = uuid();
  versions.set(v1, {
    id: v1,
    bundleId: "com.updateboard.sample",
    mode: "release",
    version: "1.0.0",
    releaseNote: "최초 정식 릴리스",
    forceUpdate: false,
    isLatest: true,
    createdAt: now,
  });

  const v2 = uuid();
  versions.set(v2, {
    id: v2,
    bundleId: "com.updateboard.sample",
    mode: "release",
    version: "0.9.0",
    releaseNote: "베타 릴리스. 이 버전 미만은 강제 업데이트 대상.",
    forceUpdate: true,
    isLatest: false,
    createdAt: now,
  });

  const v3 = uuid();
  versions.set(v3, {
    id: v3,
    bundleId: "com.updateboard.sample",
    mode: "debug",
    version: "1.0.1",
    releaseNote: "디버그 빌드",
    forceUpdate: false,
    isLatest: true,
    createdAt: now,
  });

  // App 2 — Demo App (Android)
  apps.set("com.updateboard.demo", {
    bundleId: "com.updateboard.demo",
    name: "Demo App",
    platform: "android",
    description: "Phase 1 데모용 두 번째 앱",
    createdAt: now,
    updatedAt: now,
  });

  const v4 = uuid();
  versions.set(v4, {
    id: v4,
    bundleId: "com.updateboard.demo",
    mode: "release",
    version: "2.3.0",
    releaseNote: "최신 안정 버전",
    forceUpdate: false,
    isLatest: true,
    createdAt: now,
  });

  const v5 = uuid();
  versions.set(v5, {
    id: v5,
    bundleId: "com.updateboard.demo",
    mode: "release",
    version: "2.0.0",
    releaseNote: "Major 2 첫 릴리스. 이 버전 미만은 강제 업데이트 대상.",
    forceUpdate: true,
    isLatest: false,
    createdAt: now,
  });

  // API Key 1 — Sample 앱 전용
  const k1 = uuid();
  apiKeys.set(k1, {
    id: k1,
    name: "Sample iOS Prod",
    bundleId: "com.updateboard.sample",
    tokenPrefix: "uk_live_demo",
    tokenHash: "uk_live_demo_seed_token_value",
    createdAt: now,
    lastUsedAt: null,
    revokedAt: null,
  });

  return { apps, versions, apiKeys };
}

function uuid(): string {
  return crypto.randomUUID();
}

function generateToken(): { full: string; prefix: string } {
  // uk_live_<24자 base36> 형태
  const random = Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join("");
  const full = `uk_live_${random}`;
  return { full, prefix: full.slice(0, 12) };
}

class MockRepo implements Repo {
  async listApps(): Promise<App[]> {
    const store = getStore();
    return Array.from(store.apps.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async getApp(bundleId: string): Promise<App | null> {
    return getStore().apps.get(bundleId) ?? null;
  }

  async createApp(input: CreateAppInput): Promise<App> {
    const store = getStore();
    if (store.apps.has(input.bundleId)) {
      throw new Error(`이미 존재하는 bundleId: ${input.bundleId}`);
    }
    const now = new Date();
    const app: App = {
      bundleId: input.bundleId,
      name: input.name,
      platform: input.platform,
      description: input.description,
      storeUrl: input.storeUrl,
      createdAt: now,
      updatedAt: now,
    };
    store.apps.set(app.bundleId, app);
    return app;
  }

  async updateApp(bundleId: string, input: UpdateAppInput): Promise<App> {
    const store = getStore();
    const existing = store.apps.get(bundleId);
    if (!existing) throw new Error(`존재하지 않는 bundleId: ${bundleId}`);
    const { storeUrl, ...rest } = input;
    const updated: App = {
      ...existing,
      ...rest,
      // storeUrl === null 은 명시적 clear, undefined 는 변경 없음, string 은 덮어쓰기
      ...(storeUrl !== undefined && { storeUrl: storeUrl ?? undefined }),
      updatedAt: new Date(),
    };
    store.apps.set(bundleId, updated);
    return updated;
  }

  async deleteApp(bundleId: string): Promise<void> {
    const store = getStore();
    if (!store.apps.delete(bundleId)) {
      throw new Error(`존재하지 않는 bundleId: ${bundleId}`);
    }
    // 이 앱의 모든 버전·키 cascade 삭제
    for (const [id, v] of store.versions) {
      if (v.bundleId === bundleId) store.versions.delete(id);
    }
    for (const [id, k] of store.apiKeys) {
      if (k.bundleId === bundleId) store.apiKeys.delete(id);
    }
  }

  async listVersions(bundleId: string): Promise<AppVersion[]> {
    return Array.from(getStore().versions.values())
      .filter((v) => v.bundleId === bundleId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getVersion(versionId: string): Promise<AppVersion | null> {
    return getStore().versions.get(versionId) ?? null;
  }

  async createVersion(input: CreateVersionInput): Promise<AppVersion> {
    const store = getStore();
    if (!store.apps.has(input.bundleId)) {
      throw new Error(`존재하지 않는 bundleId: ${input.bundleId}`);
    }
    if (input.isLatest) {
      // 같은 (bundleId, mode) 의 기존 latest 해제
      for (const [id, v] of store.versions) {
        if (v.bundleId === input.bundleId && v.mode === input.mode && v.isLatest) {
          store.versions.set(id, { ...v, isLatest: false });
        }
      }
    }
    const id = uuid();
    const version: AppVersion = {
      id,
      bundleId: input.bundleId,
      mode: input.mode,
      version: input.version,
      releaseNote: input.releaseNote,
      forceUpdate: input.forceUpdate,
      isLatest: input.isLatest,
      createdAt: new Date(),
    };
    store.versions.set(id, version);
    return version;
  }

  async updateVersion(versionId: string, input: UpdateVersionInput): Promise<AppVersion> {
    const store = getStore();
    const existing = store.versions.get(versionId);
    if (!existing) throw new Error(`존재하지 않는 versionId: ${versionId}`);
    if (input.isLatest === true) {
      for (const [id, v] of store.versions) {
        if (
          id !== versionId &&
          v.bundleId === existing.bundleId &&
          v.mode === existing.mode &&
          v.isLatest
        ) {
          store.versions.set(id, { ...v, isLatest: false });
        }
      }
    }
    const updated: AppVersion = { ...existing, ...input };
    store.versions.set(versionId, updated);
    return updated;
  }

  async deleteVersion(versionId: string): Promise<void> {
    const store = getStore();
    if (!store.versions.delete(versionId)) {
      throw new Error(`존재하지 않는 versionId: ${versionId}`);
    }
  }

  async listApiKeys(): Promise<ApiKey[]> {
    return Array.from(getStore().apiKeys.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async createApiKey(input: CreateApiKeyInput): Promise<IssuedApiKey> {
    const store = getStore();
    const id = uuid();
    const { full, prefix } = generateToken();
    const apiKey: ApiKey = {
      id,
      name: input.name,
      bundleId: input.bundleId,
      tokenPrefix: prefix,
      tokenHash: full, // Phase 1 plain
      createdAt: new Date(),
      lastUsedAt: null,
      revokedAt: null,
    };
    store.apiKeys.set(id, apiKey);
    return { apiKey, fullToken: full };
  }

  async revokeApiKey(id: string): Promise<void> {
    const store = getStore();
    const existing = store.apiKeys.get(id);
    if (!existing) throw new Error(`존재하지 않는 apiKey: ${id}`);
    store.apiKeys.set(id, { ...existing, revokedAt: new Date() });
  }

  async countSummary() {
    const store = getStore();
    const apiKeys = Array.from(store.apiKeys.values());
    return {
      apps: store.apps.size,
      versions: store.versions.size,
      apiKeysActive: apiKeys.filter((k) => k.revokedAt === null).length,
      apiKeysRevoked: apiKeys.filter((k) => k.revokedAt !== null).length,
    };
  }

  async recentVersions(limit: number): Promise<AppVersion[]> {
    return Array.from(getStore().versions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const mockRepo = new MockRepo();
