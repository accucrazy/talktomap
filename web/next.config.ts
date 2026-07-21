import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run / Docker 部署用：產出自帶 server 的最小化 bundle
  output: "standalone",
};

export default nextConfig;
