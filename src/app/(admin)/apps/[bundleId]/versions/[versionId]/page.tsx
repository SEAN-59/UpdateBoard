// 버전 상세/편집 페이지

import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getRepo } from "@/lib/repo";
import { VersionEditForm } from "./version-edit-form";

type PageProps = {
  params: Promise<{ bundleId: string; versionId: string }>;
};

export default async function VersionDetailPage({ params }: PageProps) {
  const { bundleId: rawBundleId, versionId: rawVersionId } = await params;
  const bundleId = decodeURIComponent(rawBundleId);
  const versionId = decodeURIComponent(rawVersionId);

  const repo = getRepo();
  const [app, version] = await Promise.all([
    repo.getApp(bundleId),
    repo.getVersion(versionId),
  ]);
  if (!app || !version || version.bundleId !== bundleId) notFound();

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Admin", href: "/" },
          { label: "앱 관리", href: "/apps" },
          { label: app.name, href: `/apps/${encodeURIComponent(bundleId)}` },
          { label: `${version.version} (${version.mode})` },
        ]}
      />
      <PageHeader
        title={`버전 ${version.version}`}
        description={`${app.name} · ${version.mode === "release" ? "Release" : "Debug"}`}
      />
      <VersionEditForm version={version} />
    </>
  );
}
