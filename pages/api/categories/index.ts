// pages/api/categories/index.ts
import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get categories from KV
    const categories = await kv.get<string[]>('categories');
    res.status(200).json(categories || []);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
