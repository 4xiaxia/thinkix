import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@drawnix/drawnix',
    '@plait-board/react-board',
    '@plait-board/react-text',
  ],
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};

    const plaitPackages = [
      '@plait/core',
      '@plait/common',
      '@plait/draw',
      '@plait/mind',
      '@plait/text',
      '@plait/text-plugins',
      '@plait/layouts',
    ];

    plaitPackages.forEach(pkg => {
      try {
        config.resolve.alias[pkg] = require.resolve(pkg);
      } catch {
        // Skip if package not installed
      }
    });

    return config;
  },
};

export default nextConfig;
