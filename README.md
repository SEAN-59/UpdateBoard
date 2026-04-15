<a id="top"></a>

# UpdateBoard

<div align="center">

## 언어 / Language

### [한국어로 보기](#한국어)　|　[Read in English](#english)

</div>

---

<a id="한국어"></a>

## 한국어

개인 프로젝트용 **앱 버전 관리 서비스**. 자체 서버를 두기 애매한 소규모 앱이 "최신 버전 확인 / 강제 업데이트" 기능을 붙일 수 있도록, 중앙에서 버전 정보를 등록·조회할 수 있는 관리 보드와 API를 제공한다.

---

### 무엇을 하는가

클라이언트 앱은 `bundleId` 와 `mode` (`dev` / `prod`) 두 값만 서버에 보내면, 현재 등록된

- **최신 버전** (`latestVersion`)
- **강제 업데이트 기준 버전** (`minSupportedVersion`)

두 값을 돌려받는다. 이후 스토어 이동·앱 종료 등 실제 업데이트 UX는 **앱이 스스로 판단해서 처리**한다. UpdateBoard는 "정답지"만 제공한다.

#### 클라이언트 앱이 기대하는 흐름

1. 앱 실행 시 `POST /api/version/lookup` 에 `{ bundleId, mode }` 전달
2. 응답의 `latestVersion` 과 앱 현재 버전이 같으면 → 정상 진행
3. 앱 현재 버전이 낮으면 → `minSupportedVersion` 과 비교
   - 현재 버전이 `minSupportedVersion` 보다 낮으면 **강제 업데이트** (스토어 이동 / 앱 종료 등)
   - 아니면 선택 업데이트 안내 후 진행

> 실제 "스토어 이동" 같은 동작은 이 프로젝트의 범위 밖이며, 앱 쪽에서 구현한다.

---

### 핵심 개념

| 개념 | 설명 |
|---|---|
| `bundleId` | 프로젝트(앱) 식별자. 등록 단위. |
| `mode` | `dev` / `prod` 두 종류. 동일 번들이 환경별로 다른 버전을 가질 수 있도록. 추후 확장 가능. |
| `version` | 등록하는 릴리즈 버전 문자열 (예: `1.2.3`) |
| `isForceUpdate` | 이 버전이 "강제 업데이트 기준선"이 되는지 여부 |
| `changelog` | 변경 사항 메모 |

---

### 기술 스택

- **Next.js** (App Router, standalone output)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Prisma** (ORM)
- **MariaDB**

---

### 아키텍처 개요

```
[클라이언트 앱]
      │  POST /api/version/lookup
      ▼
[HTTPS Reverse Proxy]
      │
      ├─ 운영(release) 런타임
      └─ 개발(debug)  런타임
                │
                ▼
            MariaDB
```

#### 컨테이너 구성

| 역할 | 설명 |
|---|---|
| 빌드 (debug/release) | 소스를 마운트해 `npm install && npm run build` 를 돌린 뒤 `.next/standalone` 산출물을 빌드 볼륨으로 복사하고 종료하는 1회성 컨테이너 |
| 런타임 (debug/release) | 빌드 볼륨을 읽어 `node server.js` 만 실행하는 상주 컨테이너 |
| DB | MariaDB 상주 컨테이너. 데이터는 호스트 볼륨에 영속화 |

---

### 필수 설정

#### `next.config.ts` — standalone 출력 활성화

컨테이너 구성이 `.next/standalone` 을 복사하는 구조이므로 **반드시** 다음 설정이 필요하다.

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

이 설정이 없으면 build 컨테이너가 `.next/standalone not found` 로 실패한다.

---

### 환경 변수

환경 변수 파일은 서버 스토리지에서 저장·관리한다. 저장소에는 포함하지 않는다.

---

### API

#### 조회 (공개)

클라이언트 앱이 호출하는 조회 엔드포인트. 식별자가 URL·로그·캐시에 남지 않도록 **POST** 로 설계한다.

```
POST /api/version/lookup
Content-Type: application/json

{
  "bundleId": "<bundleId>",
  "mode": "dev" | "prod"
}
```

**응답 예시**

```json
{
  "bundleId": "com.example.myapp",
  "mode": "prod",
  "latestVersion": "1.4.2",
  "minSupportedVersion": "1.3.0"
}
```

- 인증 없음. 앱이 직접 호출한다.
- `minSupportedVersion` 은 해당 `(bundleId, mode)` 에서 `isForceUpdate = true` 인 가장 최근 버전.

#### 등록 / 수정 (보호됨)

버전 생성·수정·삭제 엔드포인트는 관리자 쿠키를 요구한다. 관리자 페이지(`/admin/*`)도 동일.

---

### 인증 방식

- 관리자 한 명만 사용하는 전제.
- `ADMIN_ID` + `ADMIN_PW_HASH` (bcrypt) 로 `/login` 에서 검증 → httpOnly · SameSite=Lax · Secure (prod) 쿠키 발급.
- 세션 쿠키는 `SESSION_SECRET` 으로 **HMAC-SHA256 서명** 되며 `{ userId, exp }` payload 를 포함한다. 위변조되거나 만료된 쿠키는 즉시 `/login` 으로 redirect.
- 세션 TTL: 8시간. 만료 후 재로그인 필요.
- `/login` 은 IP 기준 rate limit — 15분에 5회.
- 공개 API (`/api/v1/versions/*`) 는 API 키 기준 rate limit — 분당 60회.
- 서버는 HTTPS 리버스 프록시 뒤에 있어야 한다. (평문 HTTP 환경에서는 쿠키/비밀번호가 노출될 수 있다.)

#### `SESSION_SECRET` 로테이션

- 용도: 세션 쿠키 서명 키. 유출 시 공격자가 임의 관리자로 위장 가능.
- 로테이션 방법: `openssl rand -base64 48` 로 새 값을 생성해 `.env.local` / `web.dev.env` / `web.prod.env` 의 `SESSION_SECRET` 값만 교체 후 컨테이너 재배포.
- **주의**: 로테이션 시 기존에 발급된 모든 세션이 무효화되므로 재로그인 필요. 관리자 1인 구조라 부작용이 작다.

---

### 로컬 개발

```bash
npm install
npx prisma generate
npm run dev
```

Prisma 스키마 변경 후 마이그레이션

```bash
npx prisma migrate dev --name <변경_설명>
```

---

### 배포

빌드 → 런타임이 분리된 컨테이너 구조로 배포한다. 배포 순서는 대략 다음과 같다.

1. DB 기동 및 마이그레이션(`npx prisma migrate deploy`) 실행
2. 빌드 컨테이너 실행 → `.next/standalone` 산출물 생성
3. 런타임 컨테이너 기동

---

### 디렉터리 구조 (예정)

```
UpdateBoard/
├─ src/
│  └─ app/
│     ├─ api/
│     │  └─ version/        # 조회/등록/수정 API
│     ├─ admin/              # 관리자 페이지
│     └─ login/              # 로그인 페이지
├─ prisma/
│  └─ schema.prisma
├─ next.config.ts
└─ README.md
```

---

### 로드맵

- [ ] Prisma 스키마 설계 (`Project`, `Version`)
- [ ] 조회 API (`POST /api/version/lookup`)
- [ ] 관리자 페이지 (프로젝트·버전 CRUD)
- [ ] 로그인 + 쿠키 기반 인증 + middleware
- [ ] `next.config.ts` standalone 설정
- [ ] 배포 검증
- [ ] (추후) `mode` 동적 확장 기능

<div align="right">

[↑ 맨 위로 돌아가기](#top)

</div>

---

<a id="english"></a>

## English

A personal-use **app version management service**. UpdateBoard provides a central admin board and API so that small apps — the kind where standing up a dedicated backend just for version checks is overkill — can still support "latest version lookup" and "forced update" features.

---

### What it does

A client app sends just two values to the server — `bundleId` and `mode` (`dev` / `prod`) — and receives the currently registered

- **latest version** (`latestVersion`)
- **minimum supported version** for forced updates (`minSupportedVersion`)

The client app then **decides on its own** what to do next: navigate to the store, terminate the app, show a prompt, etc. UpdateBoard only provides the "answer key."

#### Expected client app flow

1. On app launch, `POST /api/version/lookup` with `{ bundleId, mode }`
2. If the response's `latestVersion` equals the installed version → proceed normally
3. If the installed version is lower → compare against `minSupportedVersion`
   - If the installed version is lower than `minSupportedVersion` → **force update** (redirect to store / terminate / etc.)
   - Otherwise → show an optional update notice and proceed

> Actions like "redirecting to the store" are out of scope for this project and must be implemented inside the client app itself.

---

### Core concepts

| Concept | Description |
|---|---|
| `bundleId` | Identifier for a project (app). The registration unit. |
| `mode` | One of `dev` / `prod`. Lets the same bundle carry different versions per environment. Designed to be extensible. |
| `version` | The release version string being registered (e.g. `1.2.3`) |
| `isForceUpdate` | Whether this entry is the "force update baseline" |
| `changelog` | Notes on the changes |

---

### Tech stack

- **Next.js** (App Router, standalone output)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Prisma** (ORM)
- **MariaDB**

---

### Architecture overview

```
[Client app]
      │  POST /api/version/lookup
      ▼
[HTTPS reverse proxy]
      │
      ├─ release runtime
      └─ debug   runtime
                │
                ▼
            MariaDB
```

#### Container layout

| Role | Description |
|---|---|
| Build (debug/release) | One-shot container that mounts source, runs `npm install && npm run build`, copies the `.next/standalone` output to the build volume, then exits |
| Runtime (debug/release) | Long-running container that reads the build volume and simply runs `node server.js` |
| DB | Long-running MariaDB container. Data is persisted to a host volume |

---

### Required configuration

#### `next.config.ts` — enable standalone output

Because the container setup copies `.next/standalone`, the following setting is **required**.

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

Without this, the build container fails with `.next/standalone not found`.

---

### Environment variables

Environment files are stored and managed on server storage and are **not** committed to the repository.

---

### API

#### Lookup (public)

The read endpoint called by client apps. Designed as **POST** so that identifiers don't end up in URLs, logs, or caches.

```
POST /api/version/lookup
Content-Type: application/json

{
  "bundleId": "<bundleId>",
  "mode": "dev" | "prod"
}
```

**Example response**

```json
{
  "bundleId": "com.example.myapp",
  "mode": "prod",
  "latestVersion": "1.4.2",
  "minSupportedVersion": "1.3.0"
}
```

- No authentication. Called directly by client apps.
- `minSupportedVersion` is the most recent version for `(bundleId, mode)` where `isForceUpdate = true`.

#### Create / update (protected)

Endpoints that create, update, or delete versions require the admin cookie. The admin pages (`/admin/*`) are protected the same way.

---

### Authentication

- Assumes a single administrator.
- The admin logs in at `/login` with `ADMIN_ID` + `ADMIN_PW_HASH` (bcrypt); on success an httpOnly · SameSite=Lax · Secure (prod) cookie is issued.
- The session cookie is **HMAC-SHA256 signed** with `SESSION_SECRET` and carries a `{ userId, exp }` payload. Tampered or expired cookies are rejected and the user is redirected to `/login`.
- Session TTL: 8 hours. Re-login required after expiry.
- `/login` is rate-limited per IP — 5 attempts per 15 minutes.
- The public API (`/api/v1/versions/*`) is rate-limited per API key — 60 requests per minute.
- The server must sit behind an HTTPS reverse proxy. (In a plaintext HTTP environment the cookie and password can be intercepted.)

#### Rotating `SESSION_SECRET`

- Purpose: signs session cookies. If leaked, an attacker can impersonate any admin.
- How to rotate: generate a new value with `openssl rand -base64 48`, replace `SESSION_SECRET` in `.env.local` / `web.dev.env` / `web.prod.env`, and redeploy the containers.
- **Note**: rotation invalidates all existing sessions, so a re-login is required. With a single-admin setup the impact is small.

---

### Local development

```bash
npm install
npx prisma generate
npm run dev
```

After changing the Prisma schema

```bash
npx prisma migrate dev --name <change_description>
```

---

### Deployment

The app is deployed as a split "build → runtime" container layout. The rough order is

1. Bring up the DB and run migrations (`npx prisma migrate deploy`)
2. Run the build container → produces the `.next/standalone` output
3. Start the runtime container

---

### Directory layout (planned)

```
UpdateBoard/
├─ src/
│  └─ app/
│     ├─ api/
│     │  └─ version/        # lookup / create / update API
│     ├─ admin/              # admin pages
│     └─ login/              # login page
├─ prisma/
│  └─ schema.prisma
├─ next.config.ts
└─ README.md
```

---

### Roadmap

- [ ] Design the Prisma schema (`Project`, `Version`)
- [ ] Lookup API (`POST /api/version/lookup`)
- [ ] Admin pages (CRUD for projects and versions)
- [ ] Login + cookie-based auth + middleware
- [ ] `next.config.ts` standalone setting
- [ ] Deployment verification
- [ ] (Future) Ability to extend `mode` dynamically

<div align="right">

[↑ Back to top](#top)

</div>
