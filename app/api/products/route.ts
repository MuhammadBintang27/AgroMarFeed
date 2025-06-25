import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${API_BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('store_id');
  let url = `${API_BASE}/api/products`;
  if (storeId) {
    url = `${API_BASE}/api/products/store/${storeId}`;
  }
  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
} 