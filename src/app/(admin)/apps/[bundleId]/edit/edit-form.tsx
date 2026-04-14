"use client";

// 앱 메타 편집 폼 + Danger Zone (삭제)

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardFooter } from "@/components/ui/card";
import { DangerZone } from "@/components/ui/danger-zone";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RadioCard } from "@/components/ui/radio-card";
import { PLATFORM_LIST, PLATFORM_META } from "@/lib/platform";
import type { App, Platform } from "@/lib/types";
import {
  deleteAppAction,
  updateAppAction,
  type UpdateAppFormState,
} from "./actions";

const initialState: UpdateAppFormState = { ok: false };

export function EditAppForm({ app }: { app: App }) {
  const updateBound = updateAppAction.bind(null, app.bundleId);
  const [state, formAction, pending] = useActionState(updateBound, initialState);
  const [platform, setPlatform] = useState<Platform>(app.platform);
  const [deleting, startDelete] = useTransition();

  const handleDelete = () => {
    if (!confirm(`정말 ${app.name} (${app.bundleId}) 을(를) 삭제하시겠어요?\n\n관련된 모든 버전과 API 키도 함께 삭제됩니다. 되돌릴 수 없습니다.`)) {
      return;
    }
    startDelete(async () => {
      await deleteAppAction(app.bundleId);
    });
  };

  return (
    <>
      <form action={formAction}>
        <Card>
          <CardBody>
            <FormField label="Bundle ID" hint="bundleId 는 변경할 수 없습니다.">
              <Input name="bundleIdReadonly" value={app.bundleId} readOnly className="font-mono opacity-60" />
            </FormField>

            <FormField
              label="표시 이름"
              htmlFor="name"
              required
              error={state.fieldErrors?.name}
            >
              <Input
                id="name"
                name="name"
                defaultValue={app.name}
                placeholder="예: MyApp iOS"
                maxLength={50}
                invalid={!!state.fieldErrors?.name}
              />
            </FormField>

            <FormField label="플랫폼" required error={state.fieldErrors?.platform}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PLATFORM_LIST.map((p) => {
                  const meta = PLATFORM_META[p];
                  return (
                    <RadioCard
                      key={p}
                      name="platform"
                      value={p}
                      checked={platform === p}
                      onChange={(v) => setPlatform(v as Platform)}
                      icon={meta.icon}
                      title={meta.label}
                      description={meta.description}
                    />
                  );
                })}
              </div>
            </FormField>

            <FormField label="설명" htmlFor="description">
              <Input id="description" name="description" defaultValue={app.description ?? ""} placeholder="(선택)" />
            </FormField>
          </CardBody>
          <CardFooter className="flex justify-end gap-2">
            <Link href={`/apps/${encodeURIComponent(app.bundleId)}`}>
              <Button type="button" variant="secondary">취소</Button>
            </Link>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "저장 중..." : "변경 저장"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <DangerZone
        title="앱 삭제"
        description="이 앱과 관련된 모든 버전·API 키가 함께 삭제됩니다. 되돌릴 수 없습니다."
      >
        <Button type="button" variant="danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? "삭제 중..." : `${app.name} 삭제`}
        </Button>
      </DangerZone>
    </>
  );
}
