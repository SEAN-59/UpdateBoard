"use client";

// API 키 폐기 버튼 — confirm 후 server action 호출

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { revokeApiKeyAction } from "./actions";

export function RevokeButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  const handleRevoke = () => {
    if (!confirm(`${name} 키를 폐기하시겠습니까?\n\n폐기된 키로 보내는 요청은 즉시 401 을 받게 됩니다. 되돌릴 수 없습니다.`)) {
      return;
    }
    startTransition(async () => {
      await revokeApiKeyAction(id);
    });
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleRevoke} disabled={pending} className="text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]">
      {pending ? "폐기 중..." : "폐기"}
    </Button>
  );
}
