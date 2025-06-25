import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET() {
  const res = await fetch(`${API_BASE}/api/artikels`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
