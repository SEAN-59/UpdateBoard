// 대시보드 — SummaryCard 3개 + 최근 추가된 버전 5건 (PR 1 placeholder 교체)

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/ui/summary-card";
import { TableWrap, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { getRepo } from "@/lib/repo";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const repo = getRepo();
  const [summary, recentVersions, apps] = await Promise.all([
    repo.countSummary(),
    repo.recentVersions(5),
    repo.listApps(),
  ]);

  const appByBundle = new Map(apps.map((a) => [a.bundleId, a]));
  const platformCounts = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.platform] = (acc[a.platform] ?? 0) + 1;
    return acc;
  }, {});
  const platformSub = Object.entries(platformCounts)
    .map(([p, n]) => `${p[0].toUpperCase() + p.slice(1)} ${n}`)
    .join(" · ") || "—";

  const releaseCount = recentVersions.filter((v) => v.mode === "release").length;
  const debugCount = recentVersions.length - releaseCount;

  return (
    <>
      <PageHeader
        title="대시보드"
        description="시스템 전체 현황을 한눈에 확인합니다."
      />

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          label="등록된 앱"
          value={summary.apps}
          sub={platformSub}
          tone="accent"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <line x1="4" y1="10" x2="20" y2="10" />
              <line x1="10" y1="4" x2="10" y2="20" />
            </svg>
          }
        />
        <SummaryCard
          label="버전 레코드"
          value={summary.versions}
          sub={`Release ${releaseCount} · Debug ${debugCount} (최근 5건 기준)`}
          tone="success"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          }
        />
        <SummaryCard
          label="API 키"
          value={summary.apiKeysActive + summary.apiKeysRevoked}
          sub={`활성 ${summary.apiKeysActive} · 폐기 ${summary.apiKeysRevoked}`}
          tone="info"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          }
        />
      </div>

      {/* Recent Versions */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">최근 추가된 버전</h2>
        <Link href="/apps">
          <Button variant="ghost" size="sm">전체 보기 →</Button>
        </Link>
      </div>

      {recentVersions.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-12 text-center text-sm text-[var(--color-text-muted)]">
          아직 등록된 버전이 없습니다.
        </div>
      ) : (
        <TableWrap>
          <THead>
            <TH className="text-left">앱</TH>
            <TH>버전</TH>
            <TH>모드</TH>
            <TH>플래그</TH>
            <TH>등록일</TH>
          </THead>
          <TBody>
            {recentVersions.map((v) => {
              const app = appByBundle.get(v.bundleId);
              return (
                <TR key={v.id}>
                  <TD className="text-left">
                    {app ? (
                      <>
                        <div className="font-medium">{app.name}</div>
                        <div className="font-mono text-xs text-[var(--color-text-muted)]">{v.bundleId}</div>
                      </>
                    ) : (
                      <span className="font-mono text-xs">{v.bundleId}</span>
                    )}
                  </TD>
                  <TD>
                    <span className="font-mono text-sm">{v.version}</span>
                  </TD>
                  <TD>
                    <Badge variant={v.mode === "release" ? "accent" : "neutral"}>
                      {v.mode === "release" ? "Release" : "Debug"}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex items-center justify-center gap-1">
                      {v.isLatest && <Badge variant="success">Latest</Badge>}
                      {v.forceUpdate && <Badge variant="warning">Force</Badge>}
                    </div>
                  </TD>
                  <TD className="text-xs text-[var(--color-text-muted)]">{formatDate(v.createdAt)}</TD>
                </TR>
              );
            })}
          </TBody>
        </TableWrap>
      )}
    </>
  );
}
