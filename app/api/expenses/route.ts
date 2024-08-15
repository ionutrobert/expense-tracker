import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  const expenses = await kv.get('expenses') || [];
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const expense = await request.json();
  const expenses = await kv.get('expenses') || [];
  expenses.push(expense);
  await kv.set('expenses', expenses);
  return NextResponse.json(expenses);
}