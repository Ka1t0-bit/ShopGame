import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output для Docker (оптимальный размер образа)
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
