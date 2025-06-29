import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://agromarfeed-backend.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 Creating review:', body);
    
    const response = await fetch(`${BACKEND_URL}/api/productReviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify(body),
    });
    
    console.log('📡 Backend response status:', response.status);
    
    const data = await response.json();
    console.log('📡 Backend response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Error in create review API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 