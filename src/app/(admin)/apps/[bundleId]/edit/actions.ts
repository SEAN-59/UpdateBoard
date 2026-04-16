"use server";

// 앱 메타 편집 + 삭제 server action

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getRepo } from "@/lib/repo";
import type { Platform } from "@/lib/types";

const ALLOWED_PLATFORMS: Platform[] = ["ios", "android", "web", "desktop"];

export type UpdateAppFormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: {
    name?: string;
    platform?: string;
    storeUrl?: string;
  };
};

export async function updateAppAction(
  bundleId: string,
  _prev: UpdateAppFormState,
  formData: FormData,
): Promise<UpdateAppFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const platformRaw = String(formData.get("platform") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || undefined;
  const storeUrlRaw = String(formData.get("storeUrl") ?? "").trim();
  // 빈 문자열은 명시적 clear → null, 값 있으면 그대로
  const storeUrl: string | null = storeUrlRaw === "" ? null : storeUrlRaw;

  const fieldErrors: UpdateAppFormState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "표시 이름을 입력하세요.";
  else if (name.length > 50) fieldErrors.name = "50자 이하여야 합니다.";
  if (!ALLOWED_PLATFORMS.includes(platformRaw as Platform)) {
    fieldErrors.platform = "플랫폼을 선택하세요.";
  }
  // storeUrl 은 http/https 뿐만 아니라 itms-apps:// / market:// 같은 네이티브 딥링크도 허용.
  // prefix 검증은 하지 않고 길이만 체크.
  if (storeUrl !== null && storeUrl.length > 500) {
    fieldErrors.storeUrl = "500자 이하여야 합니다.";
  }
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const repo = getRepo();
  await repo.updateApp(bundleId, {
    name,
    platform: platformRaw as Platform,
    description,
    storeUrl,
  });

  revalidatePath("/apps");
  revalidatePath(`/apps/${encodeURIComponent(bundleId)}`);
  revalidatePath("/");
  redirect(`/apps/${encodeURIComponent(bundleId)}`);
}

export async function deleteAppAction(bundleId: string): Promise<void> {
  const repo = getRepo();
  await repo.deleteApp(bundleId);
  revalidatePath("/apps");
  revalidatePath("/");
  redirect("/apps");
}
