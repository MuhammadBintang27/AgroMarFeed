import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");

  try {
    let res;

    if (id) {
      // Fetch berdasarkan ID
      res = await fetch(`${API_BASE}/api/konsultan/${id}`);
    } else if (slug) {
      // Fetch berdasarkan Slug (asumsi route backend kamu: /api/konsultan/slug/:slug)
      res = await fetch(`${API_BASE}/api/konsultan/slug/${slug}`);
    } else {
      // Fetch semua konsultan
      res = await fetch(`${API_BASE}/api/konsultan`);
    }

    if (!res.ok) {
      return NextResponse.json({ message: 'Gagal ambil data' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
  }
}
