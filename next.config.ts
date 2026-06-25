import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async rewrites() {
    // Only rewrite /uploads to API file server in production (standalone mode)
    // In dev mode, Next.js serves public/ files directly — no rewrite needed
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/uploads/:path*",
          destination: "/api/files/uploads/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
