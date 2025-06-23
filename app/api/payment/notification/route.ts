import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 Frontend received payment notification:', body);

    // Forward the notification to backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('📋 Backend response:', data);

    if (!response.ok) {
      console.error('❌ Backend notification processing failed:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Payment notification processed successfully');
    return NextResponse.json({ 
      message: 'Notification processed successfully',
      orderStatus: data.orderStatus,
      paymentStatus: data.paymentStatus,
      cartCleared: data.cartCleared
    });
  } catch (error) {
    console.error('❌ Error processing payment notification:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 