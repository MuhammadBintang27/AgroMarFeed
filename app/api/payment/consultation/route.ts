import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Check if response is ok
    if (!res.ok) {
      console.error('Backend API error:', res.status, res.statusText);
      return NextResponse.json(
        { 
          success: false, 
          message: `Backend API error: ${res.status} ${res.statusText}` 
        }, 
        { status: res.status }
      );
    }

    // Check content type to ensure it's JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Backend returned non-JSON response:', contentType);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Backend returned invalid response format' 
        }, 
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error in consultation payment API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
} 