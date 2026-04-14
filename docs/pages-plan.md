# 관리자 페이지 작성 계획서 — Phase 1

## 1. 배경

UpdateBoard 는 모바일/데스크톱 앱의 최신 버전·최소 지원 버전을 중앙에서 응답하는 서비스다. CI/CD 인프라와 git-flow 가 완비된 상태이며, 실제 기능 구현의 첫 단계로 **관리자 UI 뼈대** 를 먼저 만든다. 서버·DB 는 후속 Phase 에서 진행.

## 2. 목표

- Phase 1 종료 시점에 관리자가 로그인 후 앱 등록 → 버전 추가 → API 키 발급까지 UI 흐름을 한 바퀴 돌 수 있다.
- 실제 DB 없이 인메모리 mock repository 로 동작하며, Phase 2 에서 Prisma 로 스왑할 때 라우트 코드는 그대로 재사용된다.

## 3. 스코프

**포함**: 9개 라우트 페이지, `(admin)` 레이아웃, 인증 가드 stub, mock repository, Server Action 기반 폼 처리.

**제외**: 실제 DB 연결, 실제 세션 발급·검증, 공개 클라이언트 API (`/api/versions/...`), 해시된 API 키 검증, rate limit, 다국어.

## 4. 정보 구조

```
/login                                          — 관리자 로그인
/                                                — 대시보드
/apps                                            — 앱 목록
/apps/new                                        — 앱 신규 등록
/apps/[bundleId]                                 — 앱 상세
/apps/[bundleId]/edit                            — 앱 메타 편집
/apps/[bundleId]/versions/new                    — 버전 레코드 신규
/apps/[bundleId]/versions/[versionId]            — 버전 레코드 상세·편집
/api-keys                                        — API 키 발급·폐기
```

총 9개 페이지. `(auth)` / `(admin)` Route Group 으로 인증 영역을 분리한다.

## 5. 페이지별 상세

### 5.1 `/login`

- **목적**: 단일 관리자 인증
- **UI**: ID/비밀번호 입력, "로그인" 버튼, 실패 메시지
- **동작**: Server Action 에서 `ADMIN_ID` / `ADMIN_PW_HASH` 환경변수와 입력값 비교 → 성공 시 서명된 세션 쿠키 설정 후 `/` 로 redirect
- **DB**: **users 테이블 없음**. 자격증명은 전부 env 파일에 보관 (`ADMIN_ID`, `ADMIN_PW_HASH`, `SESSION_SECRET`)
- **Phase 1 범위**: 세션은 stub (고정 쿠키 값 세팅). 실제 서명·만료 검증은 Phase 2.

### 5.2 `/` (대시보드)

- **목적**: 시스템 전체 상황 한눈에 보기
- **UI**: 요약 카드 3개 — 등록된 앱 수 / 버전 레코드 수 / 발급된 API 키 수. 최근 추가된 버전 리스트 5건.
- **데이터 소스**: mock repository 집계

### 5.3 `/apps`

- **목적**: 앱 전체 목록
- **UI**: 테이블 — bundleId · 표시 이름 · 플랫폼 · 현재 release 버전 · 현재 debug 버전 · 액션 (상세/편집)
- **상단**: "신규 앱 등록" 버튼

### 5.4 `/apps/new`

- **폼 필드**: bundleId (중복 체크), 표시 이름, 플랫폼 (ios/android/web/desktop)
- **제출 후**: `/apps/[bundleId]` 로 redirect

### 5.5 `/apps/[bundleId]`

- **목적**: 한 앱의 모든 정보 표시
- **구성**:
  - 앱 메타 요약 박스 (이름, 플랫폼, bundleId, 생성일)
  - 모드 섹션 (Release / Debug) 각각:
    - **현재 latest 버전** (`isLatest=true` 레코드)
    - **현재 최소 지원 버전** (계산값: `forceUpdate=true` 레코드 중 SemVer 기준 가장 높은 것)
    - 버전 히스토리 테이블 (버전 · 릴리스 노트 요약 · force 뱃지 · latest 뱃지 · 생성일 · 편집)
    - "새 버전 추가" 버튼
- **액션**: 앱 편집 / 앱 삭제 (편집 페이지로 이동)

### 5.6 `/apps/[bundleId]/edit`

- **폼 필드**: 표시 이름, 플랫폼, bundleId (변경 시 경고)
- **추가**: 앱 삭제 버튼 (확인 모달 후 mock repository 에서 제거)

### 5.7 `/apps/[bundleId]/versions/new`

- **폼 필드**
  - 모드: debug / release 라디오
  - 버전 문자열 (SemVer 권장, 예: `1.2.3`)
  - 릴리스 노트 (textarea, markdown 허용)
  - **강제 업데이트 (이 버전을 최소 지원선으로 지정)** (checkbox)
    - 의미: 체크 시 이 버전 미만 사용자는 강제 업데이트 대상
    - 동일 (bundleId, mode) 안에서 여러 버전이 체크되어도 됨 — 실제 적용되는 바닥선은 그 중 가장 높은 버전
  - "현재 latest 로 설정" (checkbox, 체크 시 같은 (bundleId, mode) 의 기존 latest 해제)
- **제출 후**: `/apps/[bundleId]` 로 redirect

### 5.8 `/apps/[bundleId]/versions/[versionId]`

- **목적**: 버전 레코드 개별 편집
- **UI**: 5.7 과 동일한 폼 + 삭제 버튼
- **비고**: 버전 문자열은 수정 불가 (새로 만드는 게 정상 플로우)

### 5.9 `/api-keys`

- **목적**: 클라이언트 앱이 사용할 API 키 관리
- **UI**:
  - 상단: "새 키 발급" 버튼 → 모달 (이름, 스코프: 특정 앱 bundleId 또는 전역)
  - 발급 직후 한 번만 전체 토큰 노출 (복사 유도)
  - 목록 테이블: 이름 · 스코프 · 토큰 prefix (예: `uk_live_a8f3****`) · 생성일 · 마지막 사용일 · 상태 · 폐기 버튼

## 6. 데이터 모델

```ts
type App = {
  bundleId: string;
  name: string;
  platform: "ios" | "android" | "web" | "desktop";
  createdAt: Date;
  updatedAt: Date;
};

type AppVersion = {
  id: string;
  bundleId: string;
  mode: "debug" | "release";
  version: string;            // SemVer 문자열, 예: "1.2.3"
  releaseNote: string;        // markdown 허용
  forceUpdate: boolean;       // true 면 "이 버전을 최소 지원선" 으로 표시.
                              // 실제 적용되는 min = forceUpdate=true 중 SemVer 최댓값
  isLatest: boolean;          // (bundleId, mode) 당 하나만 true
  createdAt: Date;
};

type ApiKey = {
  id: string;
  name: string;
  bundleId: string | null;
  tokenPrefix: string;
  tokenHash: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
};
```

## 7. 파일 구조

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx                    ← 인증 가드 + 네비
│   │   ├── page.tsx                      (대시보드)
│   │   ├── apps/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [bundleId]/
│   │   │       ├── page.tsx
│   │   │       ├── edit/page.tsx
│   │   │       └── versions/
│   │   │           ├── new/page.tsx
│   │   │           └── [versionId]/page.tsx
│   │   └── api-keys/page.tsx
│   ├── layout.tsx                        ← 기존
│   └── globals.css                       ← 기존
└── lib/
    ├── types.ts
    ├── auth/session.ts                   ← stub getSession()
    └── repo/
        ├── index.ts                      ← getRepo() 팩토리
        └── mock.ts                       ← 인메모리 구현
```

## 8. 기술 선택

- **Next.js 16** App Router, Server Components 우선, 상호작용 필요한 지점만 `'use client'`
- **Tailwind 4** (이미 설정됨)
- **폼**: Server Action + `<form action={...}>`, 기본 HTML 유효성 검증
- **상태**: 서버 측 mock repository (프로세스 메모리). 재기동 시 초기화됨을 용인.
- **ID 생성**: `crypto.randomUUID()`

## 9. 미결 사항

1. shadcn/ui 도입 여부 (Phase 1 에서? 아니면 나중에?)
2. `react-hook-form` + `zod` 도입 여부
3. Phase 1 을 단일 PR 로 낼지 라우트별로 쪼갤지
4. API 키 스코프: 앱 단위만 허용할지, 전역 마스터 키도 허용할지

## 10. Phase 2 에서 이어받을 것

- Prisma + MariaDB 스키마 작성, `src/lib/repo/prisma.ts` 구현, `getRepo()` 에서 분기
- 공개 API 라우트 핸들러 (`GET /api/versions?bundleId=...&mode=...`)
- API 키 해싱(argon2 or bcrypt) + 검증 미들웨어
- 실제 세션 발급/검증 (next-auth 또는 자체 쿠키)
- 로그인 rate limit
