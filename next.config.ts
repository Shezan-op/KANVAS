import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // Import only the pieces we use from these barrel-heavy packages.
    optimizePackageImports: ["lucide-react", "motion"],
  },
};

export default nextConfig;
