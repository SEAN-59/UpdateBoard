// Prisma seed — Phase 2 mock repository 의 샘플 데이터를 실 DB 에 주입
// 반복 실행 가능 (upsert 로 멱등)

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 데모용 고정 API 키 — 평문을 알려진 값으로 고정해서 dev 테스트 시 curl 로 바로 호출 가능
// 주의: prod 에는 이 seed 를 돌리지 말 것 (보안상)
const DEMO_API_TOKEN = "uk_live_demoseedtoken0000000000";
const DEMO_API_PREFIX = DEMO_API_TOKEN.slice(0, 12);

async function main() {
  const now = new Date();

  // App 1 — Sample App (iOS)
  const sample = await prisma.app.upsert({
    where: { bundleId: "com.updateboard.sample" },
    update: {
      storeUrl: "https://apps.apple.com/app/id000000001",
    },
    create: {
      bundleId: "com.updateboard.sample",
      name: "Sample App",
      platform: "ios",
      description: "Phase 3 시드 샘플 앱",
      storeUrl: "https://apps.apple.com/app/id000000001",
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

  // API Key 1 — Sample 앱 전용 데모 키 (bcrypt 해시 저장)
  // 평문은 DEMO_API_TOKEN 으로 고정, dev 에서 curl 테스트용으로 바로 사용 가능
  const existingKey = await prisma.apiKey.findFirst({
    where: { name: "Sample iOS Prod" },
  });
  if (existingKey) {
    // 기존 키 재해싱 (PR 1 시점에 평문으로 저장된 값 덮어쓰기)
    await prisma.apiKey.update({
      where: { id: existingKey.id },
      data: {
        tokenPrefix: DEMO_API_PREFIX,
        tokenHash: await bcrypt.hash(DEMO_API_TOKEN, 10),
        revokedAt: null,
      },
    });
  } else {
    await prisma.apiKey.create({
      data: {
        name: "Sample iOS Prod",
        bundleId: sample.bundleId,
        tokenPrefix: DEMO_API_PREFIX,
        tokenHash: await bcrypt.hash(DEMO_API_TOKEN, 10),
      },
    });
  }

  const counts = {
    apps: await prisma.app.count(),
    versions: await prisma.appVersion.count(),
    apiKeys: await prisma.apiKey.count(),
  };
  console.log("Seed complete:", counts);
  console.log(`\nDemo API token (dev only): ${DEMO_API_TOKEN}`);
  console.log("Test: curl -H \"Authorization: Bearer ${DEMO_API_TOKEN}\" \\");
  console.log("  \"http://localhost:3000/api/v1/versions/com.updateboard.sample?mode=release\"");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
