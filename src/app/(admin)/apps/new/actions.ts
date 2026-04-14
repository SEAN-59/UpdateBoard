"use server";

// 앱 등록 server action

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getRepo } from "@/lib/repo";
import type { Platform } from "@/lib/types";

const BUNDLE_ID_REGEX = /^[a-z][a-z0-9]*(\.[a-z0-9][a-z0-9-]*)+$/;
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

  if (!bundleId) {
    fieldErrors.bundleId = "Bundle ID 를 입력하세요.";
  } else if (bundleId.length < 4 || bundleId.length > 100) {
    fieldErrors.bundleId = "4자 이상, 100자 이하여야 합니다.";
  } else if (!BUNDLE_ID_REGEX.test(bundleId)) {
    fieldErrors.bundleId = "역순 도메인 형식을 따라야 합니다 (예: com.company.app).";
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
