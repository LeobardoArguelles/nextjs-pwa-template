import path from 'path';
import process from 'process';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }
    config.resolve.alias['public'] = path.join(process.cwd(), 'public');
    return config;
  },
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: isProd ? 'app.yourdomain.com' : 'localhost:3000',
          },
        ],
        destination: '/app/:path*',
      },
    ];
  },
};

export default nextConfig; 
