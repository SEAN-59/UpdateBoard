// Repository 팩토리 — 환경에 따라 mock 또는 prisma 반환 (Phase 2 에서 prisma 추가)

import type { Repo } from "./interface";
import { mockRepo } from "./mock";

export function getRepo(): Repo {
  return mockRepo;
}

export type { Repo } from "./interface";
