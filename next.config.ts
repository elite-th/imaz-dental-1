import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Tell Next.js this project IS the workspace root, so the standalone
  // output is placed at .next/standalone/server.js (not nested under
  // IMAZ/imaz-dental/). Without this, Next.js picks the parent
  // bun.lock as the root and nests the output.
  outputFileTracingRoot: __dirname,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Prisma + Next.js (webpack + standalone) fix:
  // Keep @prisma/client & its engine OUT of the webpack bundle so the
  // query engine binary can be resolved from node_modules at runtime.
  // Without this, `next build` fails at "Collecting page data" with:
  //   Error: @prisma/client did not initialize yet.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/instrumentation",
    ".prisma",
  ],
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
