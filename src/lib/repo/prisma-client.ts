// PrismaClient 싱글톤 — Next.js dev 핫리로드에서 연결 폭발 방지

import { PrismaClient } from "@prisma/client";

const PRISMA_KEY = Symbol.for("__updateboard_prisma_client__");
type GlobalWithPrisma = typeof globalThis & { [PRISMA_KEY]?: PrismaClient };

export function getPrisma(): PrismaClient {
  const g = globalThis as GlobalWithPrisma;
  if (!g[PRISMA_KEY]) {
    g[PRISMA_KEY] = new PrismaClient();
  }
  return g[PRISMA_KEY]!;
}
