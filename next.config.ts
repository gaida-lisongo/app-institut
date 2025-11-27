import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignorer les erreurs ESLint pendant le build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorer les erreurs TypeScript pendant le build
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
