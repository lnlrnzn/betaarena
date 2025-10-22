import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false, // Remove X-Powered-By header for security
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.solanatracker.io',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
