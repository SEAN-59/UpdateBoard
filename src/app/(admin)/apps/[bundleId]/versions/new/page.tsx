// 버전 신규 등록 페이지

import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getRepo } from "@/lib/repo";
import type { VersionMode } from "@/lib/types";
import { VersionForm } from "./version-form";

type PageProps = {
  params: Promise<{ bundleId: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function NewVersionPage({ params, searchParams }: PageProps) {
  const { bundleId: rawBundleId } = await params;
  const { mode } = await searchParams;
  const bundleId = decodeURIComponent(rawBundleId);
  const app = await getRepo().getApp(bundleId);
  if (!app) notFound();

  const defaultMode: VersionMode = mode === "debug" ? "debug" : "release";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Admin", href: "/" },
          { label: "앱 관리", href: "/apps" },
          { label: app.name, href: `/apps/${encodeURIComponent(bundleId)}` },
          { label: "새 버전" },
        ]}
      />
      <PageHeader
        title="새 버전 등록"
        description={`${app.name} 의 ${defaultMode === "release" ? "Release" : "Debug"} 버전 추가`}
      />
      <VersionForm bundleId={bundleId} defaultMode={defaultMode} />
    </>
  );
}
