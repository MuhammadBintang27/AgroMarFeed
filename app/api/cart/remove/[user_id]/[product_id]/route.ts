import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string; product_id: string }> }
) {
  try {
    const { user_id, product_id } = await params;
    
    console.log('API Route - user_id:', user_id, 'product_id:', product_id);
    
    const response = await fetch(`${BACKEND_URL}/api/cart/remove/${user_id}/${product_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in cart remove API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}