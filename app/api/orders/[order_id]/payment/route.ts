import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function POST(
  request: NextRequest,
  { params }: { params: { order_id: string } }
) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/orders/${params.order_id}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in payment API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 