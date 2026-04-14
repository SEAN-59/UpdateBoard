"use client";

// Tabs — 시안의 .tabs-list / .tab-item / .tab-panel 패턴
// 단일 컴포넌트로 합쳐서 children 으로 panels 받는 구조

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabDefinition<TValue extends string = string> = {
  value: TValue;
  label: string;
  content: ReactNode;
};

type TabsProps<TValue extends string = string> = {
  tabs: TabDefinition<TValue>[];
  defaultValue?: TValue;
  className?: string;
};

export function Tabs<TValue extends string = string>({
  tabs,
  defaultValue,
  className,
}: TabsProps<TValue>) {
  const [active, setActive] = useState<TValue>(defaultValue ?? tabs[0]?.value);
  const activeTab = tabs.find((t) => t.value === active);

  return (
    <div className={className}>
      <div
        className="mb-6 inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-1"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.value === active;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.value)}
              className={cn(
                "rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{activeTab?.content}</div>
    </div>
  );
}
