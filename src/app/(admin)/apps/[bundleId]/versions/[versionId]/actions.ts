"use server";

// 버전 편집 + 삭제 server action

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getRepo } from "@/lib/repo";

export type UpdateVersionFormState = {
  ok: boolean;
  fieldErrors?: { releaseNote?: string };
};

export async function updateVersionAction(
  bundleId: string,
  versionId: string,
  _prev: UpdateVersionFormState,
  formData: FormData,
): Promise<UpdateVersionFormState> {
  const releaseNote = String(formData.get("releaseNote") ?? "").trim();
  const isLatest = formData.get("isLatest") === "on";
  const forceUpdate = formData.get("forceUpdate") === "on";

  const repo = getRepo();
  await repo.updateVersion(versionId, { releaseNote, isLatest, forceUpdate });

  revalidatePath(`/apps/${encodeURIComponent(bundleId)}`);
  revalidatePath("/apps");
  revalidatePath("/");
  redirect(`/apps/${encodeURIComponent(bundleId)}`);
}

export async function deleteVersionAction(
  bundleId: string,
  versionId: string,
): Promise<void> {
  const repo = getRepo();
  await repo.deleteVersion(versionId);
  revalidatePath(`/apps/${encodeURIComponent(bundleId)}`);
  revalidatePath("/apps");
  revalidatePath("/");
  redirect(`/apps/${encodeURIComponent(bundleId)}`);
}
