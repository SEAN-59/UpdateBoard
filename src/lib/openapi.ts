// UpdateBoard Public API 의 OpenAPI 3.1 명세
// Phase 2 시점에는 실제 라우트 핸들러가 없다 — 이 문서는 Phase 3 에서
// 구현될 클라이언트용 공개 API 의 계약(contract)을 미리 고정해두는 역할.

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "UpdateBoard Public API",
    version: "1.0.0-draft",
    description: [
      "클라이언트 앱이 자기 버전을 체크하기 위해 호출하는 공개 엔드포인트입니다.",
      "",
      "**현재 상태**: Phase 3 에서 구현 예정. 이 문서는 계약 초안이며,",
      "실제 엔드포인트는 아직 동작하지 않습니다.",
      "",
      "**인증**: 발급된 API 키를 `Authorization: Bearer <token>` 헤더로 전달합니다.",
      "키 발급은 관리자 페이지의 `API 키` 메뉴에서 진행합니다.",
    ].join("\n"),
    contact: {
      name: "UpdateBoard Admin",
      email: "ksg3452@gmail.com",
    },
  },
  servers: [
    {
      url: "https://updateboard.example.com",
      description: "Production (예시 — 실제 배포 도메인으로 교체)",
    },
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  security: [{ BearerAuth: [] }],
  tags: [
    {
      name: "Versions",
      description: "앱 버전 조회 — 최신 버전과 최소 지원 버전을 함께 반환합니다.",
    },
  ],
  paths: {
    "/api/v1/versions/{bundleId}": {
      get: {
        tags: ["Versions"],
        summary: "특정 앱의 버전 정보 조회",
        description: [
          "주어진 `bundleId` 와 `mode` 에 대한 최신 버전 (latest) 과",
          "최소 지원 버전 (min, 즉 `forceUpdate=true` 인 버전 중 SemVer 최댓값) 을 반환합니다.",
          "",
          "**클라이언트 사용 예**:",
          "1. 앱 시작 시 이 엔드포인트를 호출",
          "2. 응답의 `min` 보다 자기 버전이 낮으면 → **강제 업데이트** 화면",
          "3. `latest` 보다 낮으면 → 선택적 업데이트 안내",
          "4. `latest` 와 같으면 → 그대로 진입",
        ].join("\n"),
        operationId: "getVersionInfo",
        parameters: [
          {
            name: "bundleId",
            in: "path",
            required: true,
            description: "앱의 bundle identifier (예: `com.example.myapp`)",
            schema: { type: "string", example: "com.updateboard.sample" },
          },
          {
            name: "mode",
            in: "query",
            required: true,
            description: "조회할 빌드 모드",
            schema: {
              type: "string",
              enum: ["debug", "release"],
              example: "release",
            },
          },
        ],
        responses: {
          "200": {
            description: "버전 정보 조회 성공",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VersionInfo" },
                examples: {
                  hasMin: {
                    summary: "min 지원선이 설정된 경우",
                    value: {
                      bundleId: "com.updateboard.sample",
                      mode: "release",
                      latest: "1.0.0",
                      min: "0.9.0",
                      releaseNote: "최초 정식 릴리스",
                    },
                  },
                  noMin: {
                    summary: "min 지원선이 없는 경우",
                    value: {
                      bundleId: "com.updateboard.sample",
                      mode: "debug",
                      latest: "1.0.1",
                      min: null,
                      releaseNote: "디버그 빌드",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "API 키 누락 또는 무효",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "해당 bundleId 또는 mode 의 버전 정보를 찾을 수 없음",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "API Key",
        description:
          "관리자 페이지의 `API 키` 메뉴에서 발급한 토큰. `Authorization: Bearer <token>` 헤더로 전달.",
      },
    },
    schemas: {
      VersionInfo: {
        type: "object",
        required: ["bundleId", "mode", "latest", "min"],
        properties: {
          bundleId: {
            type: "string",
            description: "요청한 앱의 bundle identifier",
            example: "com.updateboard.sample",
          },
          mode: {
            type: "string",
            enum: ["debug", "release"],
            description: "응답이 가리키는 빌드 모드",
          },
          latest: {
            type: "string",
            description: "현재 최신 버전 (SemVer)",
            example: "1.0.0",
          },
          min: {
            type: ["string", "null"],
            description:
              "최소 지원 버전. 이 값보다 낮은 클라이언트는 강제 업데이트 대상. 설정 안 된 경우 null.",
            example: "0.9.0",
          },
          releaseNote: {
            type: "string",
            description: "최신 버전의 릴리스 노트 (markdown 허용)",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "string",
            description: "에러 코드",
            example: "unauthorized",
          },
          message: {
            type: "string",
            description: "사람이 읽을 수 있는 에러 설명",
            example: "API key is missing or invalid.",
          },
        },
      },
    },
  },
} as const;
