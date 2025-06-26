import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ product_id: string }> }
) {
  try {
    const { product_id } = await params;
    const response = await fetch(`${BACKEND_URL}/api/productReviews/${product_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in get product reviews API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 