// Prisma seed — Phase 2 mock repository 의 샘플 데이터를 실 DB 에 주입
// 반복 실행 가능 (upsert 로 멱등)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  // App 1 — Sample App (iOS)
  const sample = await prisma.app.upsert({
    where: { bundleId: "com.updateboard.sample" },
    update: {},
    create: {
      bundleId: "com.updateboard.sample",
      name: "Sample App",
      platform: "ios",
      description: "Phase 3 시드 샘플 앱",
      createdAt: now,
      updatedAt: now,
    },
  });

  await prisma.appVersion.createMany({
    data: [
      {
        bundleId: sample.bundleId,
        mode: "release",
        version: "1.0.0",
        releaseNote: "최초 정식 릴리스",
        forceUpdate: false,
        isLatest: true,
      },
      {
        bundleId: sample.bundleId,
        mode: "release",
        version: "0.9.0",
        releaseNote: "베타 릴리스. 이 버전 미만은 강제 업데이트 대상.",
        forceUpdate: true,
        isLatest: false,
      },
      {
        bundleId: sample.bundleId,
        mode: "debug",
        version: "1.0.1",
        releaseNote: "디버그 빌드",
        forceUpdate: false,
        isLatest: true,
      },
    ],
    skipDuplicates: true,
  });

  // App 2 — Demo App (Android)
  const demo = await prisma.app.upsert({
    where: { bundleId: "com.updateboard.demo" },
    update: {},
    create: {
      bundleId: "com.updateboard.demo",
      name: "Demo App",
      platform: "android",
      description: "Phase 3 시드 두 번째 앱",
      createdAt: now,
      updatedAt: now,
    },
  });

  await prisma.appVersion.createMany({
    data: [
      {
        bundleId: demo.bundleId,
        mode: "release",
        version: "2.3.0",
        releaseNote: "최신 안정 버전",
        forceUpdate: false,
        isLatest: true,
      },
      {
        bundleId: demo.bundleId,
        mode: "release",
        version: "2.0.0",
        releaseNote: "Major 2 첫 릴리스. 이 버전 미만은 강제 업데이트 대상.",
        forceUpdate: true,
        isLatest: false,
      },
    ],
    skipDuplicates: true,
  });

  // API Key 1 — Sample 앱 전용 데모 키 (Phase 3 에서는 tokenHash 를 평문 그대로 — PR 2 에서 bcrypt 로 교체)
  const existingKey = await prisma.apiKey.findFirst({
    where: { name: "Sample iOS Prod" },
  });
  if (!existingKey) {
    await prisma.apiKey.create({
      data: {
        name: "Sample iOS Prod",
        bundleId: sample.bundleId,
        tokenPrefix: "uk_live_demo",
        tokenHash: "uk_live_demo_seed_token_value",
      },
    });
  }

  const counts = {
    apps: await prisma.app.count(),
    versions: await prisma.appVersion.count(),
    apiKeys: await prisma.apiKey.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
