import type { NextApiRequest, NextApiResponse } from 'next';

function xmlEscape(s: string) {
  return s.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;','\'':'&apos;'}[c] as string));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:3000';
  const origin = `${proto}://${host}`;
  const lastmod = new Date().toISOString();
  const urls = [ `${origin}/` ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => `\n  <url>\n    <loc>${xmlEscape(u)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`).join('') +
    `\n</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(body);
}


