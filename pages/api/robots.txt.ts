import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:3000';
  const origin = `${proto}://${host}`;
  const body = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${origin}/sitemap.xml`
  ].join('\n');
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(body);
}


