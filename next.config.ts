import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 이미지 빌드 시 .next/standalone 산출물을 생성하기 위해 필수
  output: "standalone",
};

export default nextConfig;
