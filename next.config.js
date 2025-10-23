/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/robots.txt', destination: '/api/robots.txt' },
      { source: '/sitemap.xml', destination: '/api/sitemap.xml' },
      // Pretty URLs to choose LP variant
      { source: '/lp/emotion', destination: '/?lp=emotion' },
      { source: '/lp/science', destination: '/?lp=science' }
    ];
  }
};

module.exports = nextConfig;


