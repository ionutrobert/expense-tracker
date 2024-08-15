import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  const categories = await kv.get('categories') || [];
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const category = await request.json();
  const categories = await kv.get('categories') || [];
  categories.push(category);
  await kv.set('categories', categories);
  return NextResponse.json(categories);
}