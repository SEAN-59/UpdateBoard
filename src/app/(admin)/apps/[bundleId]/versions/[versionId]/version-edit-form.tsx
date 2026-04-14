"use client";

// 버전 편집 폼 + Danger Zone (삭제)

import Link from "next/link";
import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardFooter } from "@/components/ui/card";
import { DangerZone } from "@/components/ui/danger-zone";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import type { AppVersion } from "@/lib/types";
import {
  deleteVersionAction,
  updateVersionAction,
  type UpdateVersionFormState,
} from "./actions";

const initialState: UpdateVersionFormState = { ok: false };

export function VersionEditForm({ version }: { version: AppVersion }) {
  const updateBound = updateVersionAction.bind(null, version.bundleId, version.id);
  const [, formAction, pending] = useActionState(updateBound, initialState);
  const [deleting, startDelete] = useTransition();

  const handleDelete = () => {
    if (!confirm(`정말 ${version.version} (${version.mode}) 을(를) 삭제하시겠어요?\n\n되돌릴 수 없습니다.`)) {
      return;
    }
    startDelete(async () => {
      await deleteVersionAction(version.bundleId, version.id);
    });
  };

  return (
    <>
      <form action={formAction}>
        <Card>
          <CardBody>
            <FormField label="버전" hint="버전 문자열은 변경할 수 없습니다. 새로 만드는 게 정상 플로우입니다.">
              <Input value={version.version} readOnly className="font-mono opacity-60" />
            </FormField>

            <FormField label="모드">
              <Input value={version.mode === "release" ? "Release" : "Debug"} readOnly className="opacity-60" />
            </FormField>

            <FormField label="릴리스 노트" htmlFor="releaseNote" hint="markdown 허용">
              <textarea
                id="releaseNote"
                name="releaseNote"
                rows={5}
                defaultValue={version.releaseNote}
                placeholder="이 버전의 변경사항을 적어주세요"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-light)]"
              />
            </FormField>

            <FormField label="플래그">
              <div className="space-y-3">
                <Toggle
                  name="isLatest"
                  defaultChecked={version.isLatest}
                  label="현재 latest 로 설정"
                  description="체크 시 같은 (bundleId, mode) 의 기존 latest 가 해제됩니다."
                />
                <Toggle
                  name="forceUpdate"
                  defaultChecked={version.forceUpdate}
                  label="강제 업데이트 (이 버전을 최소 지원선으로 지정)"
                  description="이 버전 미만 사용자는 강제 업데이트 대상이 됩니다."
                />
              </div>
            </FormField>
          </CardBody>
          <CardFooter className="flex justify-end gap-2">
            <Link href={`/apps/${encodeURIComponent(version.bundleId)}`}>
              <Button type="button" variant="secondary">취소</Button>
            </Link>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "저장 중..." : "변경 저장"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <DangerZone
        title="버전 삭제"
        description="이 버전 레코드가 영구 삭제됩니다. 되돌릴 수 없습니다."
      >
        <Button type="button" variant="danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? "삭제 중..." : `${version.version} 삭제`}
        </Button>
      </DangerZone>
    </>
  );
}
