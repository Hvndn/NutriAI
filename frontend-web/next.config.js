/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'localhost'],
    unoptimized: true, // Đảm bảo deploy lên Docker/Railway không bị crash do thiếu thư viện sharp
  },
  eslint: {
    ignoreDuringBuilds: true, // Cho phép build bỏ qua lỗi lint
  },
  typescript: {
    ignoreBuildErrors: true, // Cho phép build bỏ qua lỗi TS để deploy Railway mượt mà
  }
};

module.exports = nextConfig;

