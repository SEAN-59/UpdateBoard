// API 문서 — 클라이언트용 공개 API 의 OpenAPI 명세를 Scalar 로 렌더
// Phase 2 시점에는 실제 라우트 핸들러가 없는 "계약 초안" 임을 사용자에게 알린다

import { ApiReference } from "@/components/api-docs/api-reference";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { openApiSpec } from "@/lib/openapi";

export default function ApiDocsPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Admin", href: "/" }, { label: "API 문서" }]} />
      <PageHeader
        title="API 문서"
        description="클라이언트 앱이 사용할 공개 API 의 OpenAPI 명세입니다. Phase 3 에서 실제 엔드포인트가 구현됩니다."
      />
      <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-warning)]/40 bg-[var(--color-warning-light)] px-4 py-3">
        <p className="text-sm font-medium text-[var(--color-warning)]">
          📘 계약 초안 (Draft Contract)
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          이 문서는 Phase 3 에서 구현될 공개 API 의 사양입니다. 현재 단계에서는
          엔드포인트가 동작하지 않으며, 클라이언트 앱 개발자가 인터페이스를 미리 검토할 수
          있도록 미리 노출해둔 상태입니다.
        </p>
      </div>
      <ApiReference spec={openApiSpec} />
    </>
  );
}
