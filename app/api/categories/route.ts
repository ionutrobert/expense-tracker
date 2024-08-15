import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

type Category = string;

export async function GET() {
  const categories: Category[] = await kv.get('categories') || [];
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const category: Category = await request.json();
  const categories: Category[] = await kv.get('categories') || [];
  categories.push(category);
  await kv.set('categories', categories);
  return NextResponse.json(categories);
}