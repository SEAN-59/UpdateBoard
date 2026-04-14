"use server";

// 인증 관련 server actions — 라우트 디렉터리 밖 (재사용 가능 위치)

import { redirect } from "next/navigation";
import { clearSession } from "./session";

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}
