// ValidationList — bundleId 같은 입력의 실시간 검증 체크리스트

import { cn } from "@/lib/utils";

export type ValidationRule = {
  label: string;
  // null = 미평가 (사용자가 아직 입력 안 함), boolean = 통과/실패
  status: boolean | null;
};

export function ValidationList({
  rules,
  className,
}: {
  rules: ValidationRule[];
  className?: string;
}) {
  return (
    <ul className={cn("mt-2 space-y-1 pl-3", className)}>
      {rules.map((rule, idx) => (
        <li
          key={idx}
          className={cn(
            "flex items-center gap-1.5 text-xs transition-colors",
            rule.status === null && "text-[var(--color-text-muted)]",
            rule.status === true && "text-[var(--color-success)]",
            rule.status === false && "text-[var(--color-danger)]",
          )}
        >
          <span aria-hidden className="inline-block w-3 text-center font-bold">
            {rule.status === true ? "✓" : rule.status === false ? "✕" : "·"}
          </span>
          {rule.label}
        </li>
      ))}
    </ul>
  );
}
