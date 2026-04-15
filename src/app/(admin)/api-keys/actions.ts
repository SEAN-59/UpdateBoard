"use server";

// API 키 발급/폐기 server actions

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRepo } from "@/lib/repo";

export type CreateKeyFormState = {
  ok: boolean;
  fieldErrors?: { name?: string; bundleId?: string };
};

export async function createApiKeyAction(
  _prev: CreateKeyFormState,
  formData: FormData,
): Promise<CreateKeyFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const scope = String(formData.get("scope") ?? "").trim();
  const bundleIdRaw = String(formData.get("bundleId") ?? "").trim();

  const fieldErrors: CreateKeyFormState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "키 이름을 입력하세요.";
  else if (name.length > 50) fieldErrors.name = "50자 이하여야 합니다.";

  let bundleId: string | null = null;
  if (scope === "app") {
    if (!bundleIdRaw) fieldErrors.bundleId = "대상 앱을 선택하세요.";
    else bundleId = bundleIdRaw;
  } else if (scope === "global") {
    bundleId = null;
  } else {
    fieldErrors.bundleId = "스코프를 선택하세요.";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const repo = getRepo();
  const issued = await repo.createApiKey({ name, bundleId });
  revalidatePath("/api-keys");
  revalidatePath("/");
  // 발급 직후 한 번만 전체 토큰 노출 — query string 으로 전달해서 페이지가 배너 표시
  redirect(`/api-keys?issued=${encodeURIComponent(issued.fullToken)}&name=${encodeURIComponent(name)}`);
}

export async function revokeApiKeyAction(id: string): Promise<void> {
  const repo = getRepo();
  await repo.revokeApiKey(id);
  revalidatePath("/api-keys");
  revalidatePath("/");
  redirect("/api-keys");
}
