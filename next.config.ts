import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@plait-board/react-board',
    '@plait-board/react-text',
  ],
};

export default nextConfig;
