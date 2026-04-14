// 앱 편집 페이지

import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getRepo } from "@/lib/repo";
import { EditAppForm } from "./edit-form";

type PageProps = {
  params: Promise<{ bundleId: string }>;
};

export default async function EditAppPage({ params }: PageProps) {
  const { bundleId: rawBundleId } = await params;
  const bundleId = decodeURIComponent(rawBundleId);
  const app = await getRepo().getApp(bundleId);
  if (!app) notFound();

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Admin", href: "/" },
          { label: "앱 관리", href: "/apps" },
          { label: app.name, href: `/apps/${encodeURIComponent(bundleId)}` },
          { label: "편집" },
        ]}
      />
      <PageHeader title="앱 편집" description={app.bundleId} />
      <EditAppForm app={app} />
    </>
  );
}
