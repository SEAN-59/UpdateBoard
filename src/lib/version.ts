// SemVer 비교 + forceUpdate 기반 강제 업데이트 버전 계산

import type { AppVersion } from "./types";

// 세 자리 SemVer 문자열 ("1.2.3", "1.2.3-beta.4") 비교
// pre-release 가 있으면 "정식 < pre-release 없는 동일 버전" 규칙은 따르지 않고
// 단순 숫자 비교 + pre-release 라벨은 무시 (Phase 1 단순 모델)
export function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const partsA = parseVersion(a);
  const partsB = parseVersion(b);
  for (let i = 0; i < 3; i++) {
    if (partsA[i] > partsB[i]) return 1;
    if (partsA[i] < partsB[i]) return -1;
  }
  return 0;
}

function parseVersion(v: string): [number, number, number] {
  const stripped = v.split("-")[0]; // pre-release 제거
  const segments = stripped.split(".").map((s) => Number.parseInt(s, 10) || 0);
  return [segments[0] || 0, segments[1] || 0, segments[2] || 0];
}

// (bundleId, mode) 동일한 버전 목록에서 forceUpdate=true 인 것 중 SemVer 최댓값.
// 이 값이 "현재 유효한 강제 업데이트 버전" — 클라이언트 버전이 이보다 낮으면 강제 업데이트 대상.
// 없으면 null.
export function effectiveForceVersion(versions: AppVersion[]): AppVersion | null {
  const forced = versions.filter((v) => v.forceUpdate);
  if (forced.length === 0) return null;
  return forced.reduce((max, cur) =>
    compareSemver(cur.version, max.version) > 0 ? cur : max,
  );
}
