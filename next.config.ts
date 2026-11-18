import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets a production build run beside `next dev` without clobbering its .next folder:
  //   NEXT_DIST_DIR=.next-build npm run build
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // Import only the pieces we use from these barrel-heavy packages.
    optimizePackageImports: ["lucide-react", "motion"],
  },
};

export default nextConfig;
