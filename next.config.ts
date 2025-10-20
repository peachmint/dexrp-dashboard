import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '/dexrp-dashboard',
  assetPrefix: '/dexrp-dashboard/',
};

export default nextConfig;
