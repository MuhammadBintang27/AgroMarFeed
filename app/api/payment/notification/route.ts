import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward the notification to backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/payment/notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // If payment is successful, remove items from cart
    if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
      const orderId = data.order_id;
      
      // Get pending order info from database or localStorage equivalent
      // For now, we'll handle cart removal in the backend
      console.log(`Payment successful for order: ${orderId}`);
    }

    return NextResponse.json({ message: 'Notification processed successfully' });
  } catch (error) {
    console.error('Error processing payment notification:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 