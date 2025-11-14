import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://app.loops.so/api/v1/events/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 27b03534bfbbb8f1347064d98a5dd417',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[loops-event] API error:', response.status, data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('[loops-event] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

