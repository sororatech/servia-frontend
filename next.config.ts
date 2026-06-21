import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.20.10.4', 'localhost:3000', '127.0.0.1:3000', '192.168.188.103'],
  
  async rewrites() {
    return {
      // Let App Router handlers (including dynamic /api/recruiter/* routes) win first.
      // Django's REST endpoints have no /api/ prefix (e.g. /users/, /interviews/) —
      // only /api/schema/ and /api/docs/ do — so strip it before forwarding.
      fallback: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/:path*',
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;