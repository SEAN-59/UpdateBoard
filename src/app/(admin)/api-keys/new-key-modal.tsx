"use client";

// 신규 API 키 발급 모달

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { createApiKeyAction, type CreateKeyFormState } from "./actions";

const initialState: CreateKeyFormState = { ok: false };

type ScopeMode = "app" | "global";

type NewKeyModalProps = {
  apps: { bundleId: string; name: string }[];
};

export function NewKeyModal({ apps }: NewKeyModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createApiKeyAction, initialState);
  const [scope, setScope] = useState<ScopeMode>("app");
  const [bundleId, setBundleId] = useState(apps[0]?.bundleId ?? "");

  return (
    <>
      <Button variant="primary" size="md" onClick={() => setOpen(true)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        새 키 발급
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="새 API 키 발급"
        size="md"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" form="new-key-form" variant="primary" disabled={pending}>
              {pending ? "발급 중..." : "발급"}
            </Button>
          </>
        }
      >
        <form id="new-key-form" action={formAction}>
          <FormField
            label="키 이름"
            htmlFor="name"
            required
            hint="이 키를 어디에 사용할지 식별할 수 있는 이름"
            error={state.fieldErrors?.name}
          >
            <Input
              id="name"
              name="name"
              placeholder="예: prod-ios-main"
              autoComplete="off"
              maxLength={50}
              invalid={!!state.fieldErrors?.name}
            />
          </FormField>

          <FormField label="스코프" required error={state.fieldErrors?.bundleId}>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] p-3 has-[:checked]:border-[var(--color-accent)] has-[:checked]:bg-[var(--color-accent-light)]">
                <input
                  type="radio"
                  name="scope"
                  value="app"
                  checked={scope === "app"}
                  onChange={() => setScope("app")}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">특정 앱</div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    선택한 앱의 버전 정보만 조회할 수 있습니다.
                  </div>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] p-3 has-[:checked]:border-[var(--color-accent)] has-[:checked]:bg-[var(--color-accent-light)]">
                <input
                  type="radio"
                  name="scope"
                  value="global"
                  checked={scope === "global"}
                  onChange={() => setScope("global")}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                    전역 <span className="ml-1 rounded-full bg-[var(--color-warning-light)] px-2 py-0.5 text-[10px] text-[var(--color-warning)]">주의</span>
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    등록된 모든 앱에 접근 가능합니다. 신중히 사용하세요.
                  </div>
                </div>
              </label>
            </div>
          </FormField>

          {scope === "app" && (
            <FormField label="대상 앱" htmlFor="bundleId" required>
              <select
                id="bundleId"
                name="bundleId"
                value={bundleId}
                onChange={(e) => setBundleId(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-light)]"
              >
                {apps.length === 0 ? (
                  <option value="">먼저 앱을 등록하세요</option>
                ) : (
                  apps.map((a) => (
                    <option key={a.bundleId} value={a.bundleId}>
                      {a.name} — {a.bundleId}
                    </option>
                  ))
                )}
              </select>
            </FormField>
          )}
        </form>
      </Modal>
    </>
  );
}
