"use server";

// 버전 신규 등록 server action

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getRepo } from "@/lib/repo";
import type { VersionMode } from "@/lib/types";

const SEMVER_REGEX = /^\d+\.\d+\.\d+(?:[-+].+)?$/;

export type CreateVersionFormState = {
  ok: boolean;
  fieldErrors?: { version?: string; mode?: string };
};

export async function createVersionAction(
  bundleId: string,
  _prev: CreateVersionFormState,
  formData: FormData,
): Promise<CreateVersionFormState> {
  const mode = String(formData.get("mode") ?? "").trim() as VersionMode;
  const version = String(formData.get("version") ?? "").trim();
  const releaseNote = String(formData.get("releaseNote") ?? "").trim();
  const isLatest = formData.get("isLatest") === "on";
  const forceUpdate = formData.get("forceUpdate") === "on";

  const fieldErrors: CreateVersionFormState["fieldErrors"] = {};
  if (mode !== "release" && mode !== "debug") {
    fieldErrors.mode = "모드를 선택하세요.";
  }
  if (!version) {
    fieldErrors.version = "버전을 입력하세요.";
  } else if (!SEMVER_REGEX.test(version)) {
    fieldErrors.version = "SemVer 형식을 따르세요 (예: 1.2.3 또는 1.2.3-beta.1).";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const repo = getRepo();
  const app = await repo.getApp(bundleId);
  if (!app) {
    return {
      ok: false,
      fieldErrors: { version: "존재하지 않는 앱입니다." },
    };
  }

  await repo.createVersion({
    bundleId,
    mode,
    version,
    releaseNote,
    isLatest,
    forceUpdate,
  });

  revalidatePath(`/apps/${encodeURIComponent(bundleId)}`);
  revalidatePath("/apps");
  revalidatePath("/");
  redirect(`/apps/${encodeURIComponent(bundleId)}`);
}
