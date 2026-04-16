"use client";

// 신규 앱 등록 폼 — bundleId 실시간 검증 + Server Action 제출

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RadioCard } from "@/components/ui/radio-card";
import { ValidationList, type ValidationRule } from "@/components/ui/validation-list";
import { PLATFORM_LIST, PLATFORM_META } from "@/lib/platform";
import type { Platform } from "@/lib/types";
import { createAppAction, type CreateAppFormState } from "./actions";

const initialState: CreateAppFormState = { ok: false };

type AppFormProps = {
  existingBundleIds: string[];
};

export function AppForm({ existingBundleIds }: AppFormProps) {
  const [state, formAction, pending] = useActionState(createAppAction, initialState);
  const [bundleId, setBundleId] = useState("");
  const [platform, setPlatform] = useState<Platform>("ios");

  // bundleId 는 실제 iOS/Android 에서 대소문자 혼용이 흔해서 엄격한 regex 를 두지 않는다.
  // 길이와 중복만 검사한다.
  const rules: ValidationRule[] = bundleId.length === 0
    ? [
        { label: "4자 이상, 100자 이하", status: null },
        { label: "다른 앱과 중복되지 않음", status: null },
      ]
    : [
        { label: "4자 이상, 100자 이하", status: bundleId.length >= 4 && bundleId.length <= 100 },
        { label: "다른 앱과 중복되지 않음", status: !existingBundleIds.includes(bundleId) },
      ];

  return (
    <form action={formAction}>
      <Card>
        <CardBody>
          <FormField
            label="Bundle ID"
            htmlFor="bundleId"
            required
            error={state.fieldErrors?.bundleId}
          >
            <Input
              id="bundleId"
              name="bundleId"
              placeholder="com.example.myapp"
              autoComplete="off"
              className="font-mono"
              value={bundleId}
              onChange={(e) => setBundleId(e.target.value.trim())}
              invalid={!!state.fieldErrors?.bundleId}
            />
            <ValidationList rules={rules} />
          </FormField>

          <FormField
            label="표시 이름"
            htmlFor="name"
            required
            hint="관리 화면에서 앱을 구분할 때 사용됩니다. 변경 가능합니다."
            error={state.fieldErrors?.name}
          >
            <Input
              id="name"
              name="name"
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

          <FormField label="설명" htmlFor="description" hint="(선택) 앱 설명을 적어두면 목록에서 빠르게 식별할 수 있습니다.">
            <Input id="description" name="description" placeholder="(선택)" />
          </FormField>

          <FormField
            label="스토어 URL"
            htmlFor="storeUrl"
            hint="(선택) 네이티브 딥링크 전부 허용"
            error={state.fieldErrors?.storeUrl}
          >
            <Input
              id="storeUrl"
              name="storeUrl"
              placeholder="https://... 또는 itms-apps://..."
              maxLength={500}
              invalid={!!state.fieldErrors?.storeUrl}
            />
          </FormField>
        </CardBody>
        <CardFooter className="flex justify-end gap-2">
          <Link href="/apps">
            <Button type="button" variant="secondary">취소</Button>
          </Link>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "등록 중..." : "앱 등록"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
