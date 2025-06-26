import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ store_id: string }> }
) {
  try {
    const { store_id } = await params;

    if (!store_id) {
      return NextResponse.json(
        { message: 'Store ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/store/${store_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching store orders:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 