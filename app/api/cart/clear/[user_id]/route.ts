import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/cart/clear/${params.user_id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in cart clear API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 