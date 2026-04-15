"use server";

// 앱 등록 server action

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getRepo } from "@/lib/repo";
import type { Platform } from "@/lib/types";

const ALLOWED_PLATFORMS: Platform[] = ["ios", "android", "web", "desktop"];

export type CreateAppFormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: { bundleId?: string; name?: string; platform?: string };
};

export async function createAppAction(
  _prev: CreateAppFormState,
  formData: FormData,
): Promise<CreateAppFormState> {
  const bundleId = String(formData.get("bundleId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const platformRaw = String(formData.get("platform") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || undefined;

  const fieldErrors: CreateAppFormState["fieldErrors"] = {};

  // bundleId 는 실제 Apple / Google 의 형식이 느슨해서 (대소문자 혼용, PascalCase 꼬리 등)
  // 엄격한 역순 도메인 regex 는 오히려 정상 값을 차단한다. 길이와 중복만 검사.
  if (!bundleId) {
    fieldErrors.bundleId = "Bundle ID 를 입력하세요.";
  } else if (bundleId.length < 4 || bundleId.length > 100) {
    fieldErrors.bundleId = "4자 이상, 100자 이하여야 합니다.";
  }

  if (!name) {
    fieldErrors.name = "표시 이름을 입력하세요.";
  } else if (name.length > 50) {
    fieldErrors.name = "50자 이하여야 합니다.";
  }

  if (!ALLOWED_PLATFORMS.includes(platformRaw as Platform)) {
    fieldErrors.platform = "플랫폼을 선택하세요.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  const repo = getRepo();
  const existing = await repo.getApp(bundleId);
  if (existing) {
    return {
      ok: false,
      fieldErrors: { bundleId: "이미 등록된 Bundle ID 입니다." },
    };
  }

  await repo.createApp({
    bundleId,
    name,
    platform: platformRaw as Platform,
    description,
  });

  revalidatePath("/apps");
  revalidatePath("/");
  redirect(`/apps/${encodeURIComponent(bundleId)}`);
}
