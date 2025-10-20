import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: isProd ? 'export' : undefined,
  trailingSlash: isProd,
  images: {
    unoptimized: isProd
  },
  ...(isProd && {
    basePath: '/dexrp-dashboard',
    assetPrefix: '/dexrp-dashboard/',
  }),
};

export default nextConfig;
