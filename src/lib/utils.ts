// 공통 유틸리티

// className 조합 헬퍼 (Tailwind merge 없이 단순 join + falsy 제거)
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

// 날짜 포맷 (yyyy-MM-dd)
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 날짜 + 시간 포맷 (yyyy-MM-dd HH:mm)
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d)} ${HH}:${MM}`;
}
