"use client";

// 새 버전 등록 폼

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RadioCard } from "@/components/ui/radio-card";
import { Toggle } from "@/components/ui/toggle";
import type { VersionMode } from "@/lib/types";
import { createVersionAction, type CreateVersionFormState } from "./actions";

const initialState: CreateVersionFormState = { ok: false };

type VersionFormProps = {
  bundleId: string;
  defaultMode: VersionMode;
};

export function VersionForm({ bundleId, defaultMode }: VersionFormProps) {
  const bound = createVersionAction.bind(null, bundleId);
  const [state, formAction, pending] = useActionState(bound, initialState);
  const [mode, setMode] = useState<VersionMode>(defaultMode);

  return (
    <form action={formAction}>
      <Card>
        <CardBody>
          <FormField label="모드" required error={state.fieldErrors?.mode}>
            <div className="grid grid-cols-2 gap-3">
              <RadioCard
                name="mode"
                value="release"
                checked={mode === "release"}
                onChange={(v) => setMode(v as VersionMode)}
                title="Release"
                description="배포되는 정식 버전"
              />
              <RadioCard
                name="mode"
                value="debug"
                checked={mode === "debug"}
                onChange={(v) => setMode(v as VersionMode)}
                title="Debug"
                description="개발/QA 빌드"
              />
            </div>
          </FormField>

          <FormField
            label="버전 문자열"
            htmlFor="version"
            required
            hint="SemVer 형식: 1.2.3 또는 1.2.3-beta.1"
            error={state.fieldErrors?.version}
          >
            <Input
              id="version"
              name="version"
              placeholder="1.2.3"
              autoComplete="off"
              className="font-mono"
              invalid={!!state.fieldErrors?.version}
            />
          </FormField>

          <FormField label="릴리스 노트" htmlFor="releaseNote" hint="markdown 허용 (선택)">
            <textarea
              id="releaseNote"
              name="releaseNote"
              rows={5}
              placeholder="이 버전의 변경사항을 적어주세요"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-light)]"
            />
          </FormField>

          <FormField label="플래그">
            <div className="space-y-3">
              <Toggle
                name="isLatest"
                defaultChecked
                label="현재 latest 로 설정"
                description="체크 시 같은 (bundleId, mode) 의 기존 latest 가 해제됩니다."
              />
              <Toggle
                name="forceUpdate"
                label="강제 업데이트 (이 버전을 강제 업데이트 기준으로 지정)"
                description="이 버전 미만 사용자는 강제 업데이트 대상이 됩니다. 여러 버전이 체크돼도 실제 적용되는 기준은 그 중 SemVer 최댓값."
              />
            </div>
          </FormField>
        </CardBody>
        <CardFooter className="flex justify-end gap-2">
          <Link href={`/apps/${encodeURIComponent(bundleId)}`}>
            <Button type="button" variant="secondary">취소</Button>
          </Link>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "등록 중..." : "버전 등록"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
