// API 키 관리 — 목록 + 신규 발급 모달 + 폐기 + Issued Banner

import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { TableWrap, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { getRepo } from "@/lib/repo";
import { formatDate } from "@/lib/utils";
import { IssuedBanner } from "./issued-banner";
import { NewKeyModal } from "./new-key-modal";
import { RevokeButton } from "./revoke-button";

export default async function ApiKeysPage() {
  const repo = getRepo();
  const [keys, apps] = await Promise.all([repo.listApiKeys(), repo.listApps()]);
  const appByBundle = new Map(apps.map((a) => [a.bundleId, a]));
  const appOptions = apps.map((a) => ({ bundleId: a.bundleId, name: a.name }));

  return (
    <>
      <Breadcrumb items={[{ label: "Admin", href: "/" }, { label: "API 키" }]} />
      <PageHeader
        title="API 키"
        description="클라이언트 앱이 UpdateBoard 공개 API 를 호출할 때 사용할 인증 키를 관리합니다."
        actions={<NewKeyModal apps={appOptions} />}
      />

      <Suspense fallback={null}>
        <IssuedBanner />
      </Suspense>

      {keys.length === 0 ? (
        <EmptyState
          title="발급된 API 키가 없습니다"
          description="우측 상단 '새 키 발급' 버튼으로 첫 번째 키를 만드세요."
        />
      ) : (
        <TableWrap>
          <THead>
            <TH className="text-left">이름</TH>
            <TH>스코프</TH>
            <TH>토큰 Prefix</TH>
            <TH>생성일</TH>
            <TH>마지막 사용</TH>
            <TH>상태</TH>
            <TH className="text-right">액션</TH>
          </THead>
          <TBody>
            {keys.map((key) => {
              const isRevoked = key.revokedAt !== null;
              const scopeLabel = key.bundleId
                ? appByBundle.get(key.bundleId)?.name ?? key.bundleId
                : "전역";
              return (
                <TR key={key.id}>
                  <TD className="text-left font-medium">{key.name}</TD>
                  <TD>
                    <Badge variant={key.bundleId ? "accent" : "neutral"}>{scopeLabel}</Badge>
                  </TD>
                  <TD>
                    <code className="font-mono text-xs">{key.tokenPrefix}****</code>
                  </TD>
                  <TD className="text-xs text-[var(--color-text-muted)]">{formatDate(key.createdAt)}</TD>
                  <TD className="text-xs text-[var(--color-text-muted)]">
                    {key.lastUsedAt ? formatDate(key.lastUsedAt) : "—"}
                  </TD>
                  <TD>
                    {isRevoked ? (
                      <Badge variant="neutral">폐기됨</Badge>
                    ) : (
                      <Badge variant="success">활성</Badge>
                    )}
                  </TD>
                  <TD className="text-right">
                    {isRevoked ? (
                      <span className="text-xs text-[var(--color-text-disabled)]">—</span>
                    ) : (
                      <RevokeButton id={key.id} name={key.name} />
                    )}
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
