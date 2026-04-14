// 대시보드 placeholder — Phase 1 PR 1 검증용
// PR 3 에서 SummaryCard + 최근 버전 리스트로 본 구현 교체

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="대시보드"
        description="Phase 1 작업 중 — admin 셸 검증용 placeholder"
      />
      <Card>
        <CardBody>
          <p className="text-sm text-[var(--color-text-secondary)]">
            여기에 SummaryCard 3개 + 최근 추가된 버전 리스트가 PR 3 에서 들어갑니다.
          </p>
        </CardBody>
      </Card>
    </>
  );
}
