import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

type Expense = {
  id: string;
  amount: number;
  category: string;
  date: string;
};

export async function GET() {
  const expenses: Expense[] = await kv.get('expenses') || [];
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const expense: Expense = await request.json();
  const expenses: Expense[] = await kv.get('expenses') || [];
  expenses.push(expense);
  await kv.set('expenses', expenses);
  return NextResponse.json(expenses);
}