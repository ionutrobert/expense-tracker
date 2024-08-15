// pages/api/categories/add.ts
import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name } = req.body;

    // Retrieve the current list of categories
    const categories = (await kv.get<string[]>('categories')) || [];

    // Add the new category if it doesn't exist
    if (!categories.includes(name)) {
      categories.push(name);
      await kv.set('categories', categories);
      res.status(201).json({ name });
    } else {
      res.status(409).json({ message: 'Category already exists' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
