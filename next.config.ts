import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Add your current IP to this list
  allowedDevOrigins: ['172.20.10.4', 'localhost:3000', '127.0.0.1:3000', '192.168.188.103'],
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;