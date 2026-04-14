// admin 셸 — 모든 보호 라우트의 공통 레이아웃
// 세션 없으면 /login 으로 redirect

import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { getSession } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <Sidebar />
      <main className="ml-[var(--layout-sidebar-width)] min-h-screen">
        <div className="mx-auto max-w-[1100px] px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
