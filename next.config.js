/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 配置代理，解决CORS问题
  async rewrites() {
    return [
      {
        source: '/core/api/:path*',
        destination: 'http://192.168.1.222:8082/core/api/:path*',
      },
      {
        source: '/auth/api/:path*',
        destination: 'http://192.168.1.222:8082/auth/api/:path*',
      },
      {
        source: '/message/api/:path*',
        destination: 'http://192.168.1.222:8082/message/api/:path*',
      },
      {
        source: '/file/api/:path*',
        destination: 'http://192.168.1.222:8082/file/api/:path*',
      },
      {
        source: '/oauth2/:path*',
        destination: 'http://192.168.1.222:8082/oauth2/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
