import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@drawnix/drawnix',
    '@plait-board/react-board',
    '@plait-board/react-text',
  ],
};

export default nextConfig;
