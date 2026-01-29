import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'dev.s3.loco-trip.com',
        port: '9000',
        pathname: '/locotrip/**',
      },
      {
        protocol: 'https',
        hostname: 's3.loco-trip.com',
        pathname: '/locotrip/**',
      },
    ],
  },
};

export default nextConfig;
