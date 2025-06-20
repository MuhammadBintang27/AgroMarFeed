import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shipper_destination_id = searchParams.get('shipper_destination_id');
    const receiver_destination_id = searchParams.get('receiver_destination_id');
    const weight = searchParams.get('weight');
    const item_value = searchParams.get('item_value');
    const cod = searchParams.get('cod') || 'false';
    const origin_pin_point = searchParams.get('origin_pin_point');
    const destination_pin_point = searchParams.get('destination_pin_point');

    if (!shipper_destination_id || !receiver_destination_id || !weight || !item_value) {
      return NextResponse.json(
        { message: 'Missing required parameters: shipper_destination_id, receiver_destination_id, weight, and item_value are required.' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      shipper_destination_id,
      receiver_destination_id,
      weight,
      item_value,
      cod,
    });

    if (origin_pin_point) params.append('origin_pin_point', origin_pin_point);
    if (destination_pin_point) params.append('destination_pin_point', destination_pin_point);

    const response = await fetch(`${process.env.BACKEND_URL}/api/shipping/calculate?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 