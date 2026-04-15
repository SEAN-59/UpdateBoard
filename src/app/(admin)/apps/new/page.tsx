// 신규 앱 등록 페이지

import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getRepo } from "@/lib/repo";
import { AppForm } from "./app-form";

export default async function NewAppPage() {
  const repo = getRepo();
  const apps = await repo.listApps();
  const existingBundleIds = apps.map((a) => a.bundleId);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Admin", href: "/" },
          { label: "앱 관리", href: "/apps" },
          { label: "신규 등록" },
        ]}
      />
      <PageHeader
        title="신규 앱 등록"
        description="UpdateBoard 에서 관리할 애플리케이션을 추가합니다."
      />
      <AppForm existingBundleIds={existingBundleIds} />
    </>
  );
}
