// pages/api/expenses/index.ts
import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get expenses from KV
    const expenses = await kv.get<{ id: number; date: string; amount: number; category: string }[]>('expenses');
    res.status(200).json(expenses || []);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
