// Backend origin, derived from the public API URL (e.g. https://api.example.com/api -> https://api.example.com).
// Locally this is http://localhost:5000; on Vercel set NEXT_PUBLIC_API_URL to the deployed backend.
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  async rewrites() {
    return [
      {
        // Files stored by the backend's local uploads folder (development and
        // older records). New uploads in production are full Vercel Blob URLs.
        source: '/uploads/:path*',
        destination: `${apiOrigin}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
