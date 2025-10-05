/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/robots.txt', destination: '/api/robots.txt' },
      { source: '/sitemap.xml', destination: '/api/sitemap.xml' }
    ];
  }
};

module.exports = nextConfig;


