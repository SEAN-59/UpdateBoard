// 앱 목록 — apps.html 시안 패턴

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableWrap, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PLATFORM_META } from "@/lib/platform";
import { getRepo } from "@/lib/repo";
import { formatDate } from "@/lib/utils";

export default async function AppsPage() {
  const repo = getRepo();
  const apps = await repo.listApps();

  // 각 앱별로 release/debug latest 버전을 한 번에 모은다
  const latestByApp = new Map<string, { release?: string; debug?: string }>();
  for (const app of apps) {
    const versions = await repo.listVersions(app.bundleId);
    const release = versions.find((v) => v.mode === "release" && v.isLatest)?.version;
    const debug = versions.find((v) => v.mode === "debug" && v.isLatest)?.version;
    latestByApp.set(app.bundleId, { release, debug });
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Admin", href: "/" }, { label: "앱 관리" }]} />
      <PageHeader
        title="앱 관리"
        description="등록된 애플리케이션 목록과 각 앱의 현재 배포 버전을 관리합니다."
        actions={
          <Link href="/apps/new">
            <Button variant="primary" size="md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              신규 앱 등록
            </Button>
          </Link>
        }
      />

      {apps.length === 0 ? (
        <EmptyState
          title="등록된 앱이 없습니다"
          description="첫 번째 앱을 등록하고 버전 정보를 관리해보세요."
          action={
            <Link href="/apps/new">
              <Button variant="primary">신규 앱 등록</Button>
            </Link>
          }
        />
      ) : (
        <TableWrap>
          <THead>
            <TH className="text-left">앱</TH>
            <TH>플랫폼</TH>
            <TH>Release Latest</TH>
            <TH>Debug Latest</TH>
            <TH>생성일</TH>
            <TH className="text-right">액션</TH>
          </THead>
          <TBody>
            {apps.map((app) => {
              const meta = PLATFORM_META[app.platform];
              const latest = latestByApp.get(app.bundleId) ?? {};
              const initial = app.name.charAt(0).toUpperCase();
              return (
                <TR key={app.bundleId}>
                  <TD className="text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-light)] text-sm font-semibold text-[var(--color-accent-text)]">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--color-text-primary)]">{app.name}</div>
                        <div className="font-mono text-xs text-[var(--color-text-muted)]">{app.bundleId}</div>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
                  </TD>
                  <TD>
                    {latest.release ? (
                      <span className="font-mono text-sm">{latest.release}</span>
                    ) : (
                      <span className="text-xs italic text-[var(--color-text-disabled)]">(없음)</span>
                    )}
                  </TD>
                  <TD>
                    {latest.debug ? (
                      <span className="font-mono text-sm">{latest.debug}</span>
                    ) : (
                      <span className="text-xs italic text-[var(--color-text-disabled)]">(없음)</span>
                    )}
                  </TD>
                  <TD className="text-xs text-[var(--color-text-muted)]">{formatDate(app.createdAt)}</TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/apps/${encodeURIComponent(app.bundleId)}`}>
                        <Button variant="ghost" size="sm">상세</Button>
                      </Link>
                      <Link href={`/apps/${encodeURIComponent(app.bundleId)}/edit`}>
                        <Button variant="ghost" size="sm">편집</Button>
                      </Link>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </TableWrap>
      )}
    </>
  );
}
