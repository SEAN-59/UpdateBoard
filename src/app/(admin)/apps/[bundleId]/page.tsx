// 앱 상세 — Release/Debug 탭, 각 모드별 latest + min 카드 + 버전 히스토리

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Tabs, type TabDefinition } from "@/components/ui/tabs";
import { TableWrap, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PLATFORM_META } from "@/lib/platform";
import { getRepo } from "@/lib/repo";
import type { AppVersion, VersionMode } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { effectiveMinSupported } from "@/lib/version";

type PageProps = {
  params: Promise<{ bundleId: string }>;
};

export default async function AppDetailPage({ params }: PageProps) {
  const { bundleId: rawBundleId } = await params;
  const bundleId = decodeURIComponent(rawBundleId);
  const repo = getRepo();
  const app = await repo.getApp(bundleId);
  if (!app) notFound();

  const versions = await repo.listVersions(bundleId);
  const meta = PLATFORM_META[app.platform];
  const initial = app.name.charAt(0).toUpperCase();

  const releaseVersions = versions.filter((v) => v.mode === "release");
  const debugVersions = versions.filter((v) => v.mode === "debug");

  const tabs: TabDefinition<VersionMode>[] = [
    {
      value: "release",
      label: "Release",
      content: (
        <ModePanel bundleId={bundleId} mode="release" versions={releaseVersions} />
      ),
    },
    {
      value: "debug",
      label: "Debug",
      content: (
        <ModePanel bundleId={bundleId} mode="debug" versions={debugVersions} />
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Admin", href: "/" },
          { label: "앱 관리", href: "/apps" },
          { label: bundleId },
        ]}
      />
      <PageHeader
        title={app.name}
        description={app.bundleId}
        actions={
          <Link href={`/apps/${encodeURIComponent(bundleId)}/edit`}>
            <Button variant="secondary" size="md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              앱 편집
            </Button>
          </Link>
        }
      />

      {/* Meta Card */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[var(--shadow-xs)] md:grid-cols-4">
        <MetaItem label="표시 이름" value={app.name} />
        <MetaItem
          label="플랫폼"
          value={
            <span className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                {initial}
              </span>
              <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
            </span>
          }
        />
        <MetaItem
          label="Bundle ID"
          value={<span className="font-mono text-sm">{app.bundleId}</span>}
        />
        <MetaItem label="생성일" value={formatDate(app.createdAt)} />
      </div>

      <Tabs tabs={tabs} defaultValue="release" />
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">{label}</div>
      <div className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">{value}</div>
    </div>
  );
}

function ModePanel({
  bundleId,
  mode,
  versions,
}: {
  bundleId: string;
  mode: VersionMode;
  versions: AppVersion[];
}) {
  const latest = versions.find((v) => v.isLatest);
  const minVersion = effectiveMinSupported(versions);

  return (
    <>
      {/* Current Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <CurrentCard
          badge={<Badge variant="success">Latest</Badge>}
          label="현재 최신 버전"
          version={latest?.version}
          sub={
            latest
              ? `${formatDate(latest.createdAt)}${latest.forceUpdate ? " · 강제 업데이트" : ""}`
              : undefined
          }
        />
        <CurrentCard
          badge={<Badge variant="accent">Min</Badge>}
          label="최소 지원 버전"
          version={minVersion?.version}
          sub={minVersion ? `${formatDate(minVersion.createdAt)} 등록` : undefined}
        />
      </div>

      {/* Version History */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">버전 히스토리</h2>
        <Link
          href={`/apps/${encodeURIComponent(bundleId)}/versions/new?mode=${mode}`}
        >
          <Button variant="primary" size="sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            새 버전 추가
          </Button>
        </Link>
      </div>

      {versions.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-12 text-center text-sm text-[var(--color-text-muted)]">
          아직 등록된 {mode === "release" ? "Release" : "Debug"} 버전이 없습니다.
        </div>
      ) : (
        <TableWrap>
          <THead>
            <TH className="text-left">버전</TH>
            <TH className="text-left">릴리스 노트</TH>
            <TH>플래그</TH>
            <TH>등록일</TH>
            <TH className="text-right">액션</TH>
          </THead>
          <TBody>
            {versions.map((v) => (
              <TR key={v.id}>
                <TD className="text-left">
                  <span className="font-mono text-sm">{v.version}</span>
                </TD>
                <TD className="text-left">
                  <span className="line-clamp-1 text-sm text-[var(--color-text-secondary)]">
                    {v.releaseNote || (
                      <span className="italic text-[var(--color-text-disabled)]">(없음)</span>
                    )}
                  </span>
                </TD>
                <TD>
                  <div className="flex items-center justify-center gap-1">
                    {v.isLatest && <Badge variant="success">Latest</Badge>}
                    {v.forceUpdate && <Badge variant="warning">Force</Badge>}
                  </div>
                </TD>
                <TD className="text-xs text-[var(--color-text-muted)]">{formatDate(v.createdAt)}</TD>
                <TD className="text-right">
                  <Link
                    href={`/apps/${encodeURIComponent(bundleId)}/versions/${encodeURIComponent(v.id)}`}
                  >
                    <Button variant="ghost" size="sm">편집</Button>
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableWrap>
      )}
    </>
  );
}

function CurrentCard({
  badge,
  label,
  version,
  sub,
}: {
  badge: React.ReactNode;
  label: string;
  version?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[var(--shadow-xs)]">
      <div className="mb-3 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
        {badge}
        {label}
      </div>
      {version ? (
        <>
          <div className="font-mono text-2xl font-bold text-[var(--color-text-primary)]">{version}</div>
          {sub && <p className="mt-2 text-xs text-[var(--color-text-muted)]">{sub}</p>}
        </>
      ) : (
        <div className="font-mono text-base italic text-[var(--color-text-disabled)]">— 미설정</div>
      )}
    </div>
  );
}
