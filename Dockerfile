# ============================================================================
# UpdateBoard Dockerfile - Next.js standalone 멀티 스테이지 빌드
#
# Stage 구성
#   1) deps    : package.json 기준으로 node_modules 설치 (캐시 최적화)
#   2) builder : 전체 소스 복사 후 Next.js 빌드 (.next/standalone 생성)
#   3) runner  : 최소 런타임 이미지 (builder 의 산출물만 복사)
#
# 빌드 명령 예시
#   docker build -t updateboard:develop .
#   docker build -t updateboard:main .
#
# 런타임 포트
#   compose 에서 PORT 환경변수로 주입 (예: 7001 / 7002)
#   Next.js standalone server.js 가 process.env.PORT 를 자동으로 읽음
# ============================================================================

# ---- Stage 1: 의존성 설치 ----
FROM node:22-alpine AS deps
WORKDIR /app

# 락 파일 기반 재현 가능한 설치를 위해 package.json 과 lock 파일만 먼저 복사
# (소스 변경만으로 node_modules 레이어가 무효화되지 않도록 캐시 분리)
COPY package.json package-lock.json ./
RUN npm ci


# ---- Stage 2: 소스 빌드 ----
FROM node:22-alpine AS builder
WORKDIR /app

# deps 스테이지에서 받은 node_modules 를 그대로 가져옴
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# next.config.ts 에 output: "standalone" 설정이 되어 있어야
# .next/standalone 이 생성된다
RUN npm run build


# ---- Stage 3: 런타임 이미지 ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Seoul

# 비루트 사용자 생성 후 권한 최소화
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Next.js standalone 산출물과 정적 자산만 복사
# (소스 코드, devDependencies, 전체 node_modules 는 포함되지 않음)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# 외부 바인딩을 위해 0.0.0.0 필수 (기본값은 localhost 라 컨테이너 밖에서 접근 불가)
ENV HOSTNAME=0.0.0.0

# 컨테이너가 노출하는 포트는 런타임 PORT 환경변수를 따라가므로
# 여기선 문서용으로만 표기 (compose 에서 실제 포트 매핑)
EXPOSE 3000

CMD ["node", "server.js"]
