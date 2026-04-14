// Repository 팩토리 — DATABASE_URL 이 있으면 Prisma, 없으면 mock

import type { Repo } from "./interface";
import { mockRepo } from "./mock";
import { prismaRepo } from "./prisma";

export function getRepo(): Repo {
  if (process.env.DATABASE_URL) {
    return prismaRepo;
  }
  return mockRepo;
}

export type { Repo } from "./interface";
