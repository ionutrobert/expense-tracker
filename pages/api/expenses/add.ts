// pages/api/expenses/add.ts
import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { date, amount, category } = req.body;

    // Retrieve the current list of expenses
    const expenses = (await kv.get<{ id: number; date: string; amount: number; category: string }[]>('expenses')) || [];

    // Create a new expense
    const newExpense = { id: Date.now(), date, amount: parseFloat(amount), category };
    expenses.push(newExpense);

    // Save the updated list back to KV
    await kv.set('expenses', expenses);

    res.status(201).json(newExpense);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
