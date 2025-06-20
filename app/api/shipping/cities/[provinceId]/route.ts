import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provinceId: string }> }
) {
  try {
    const { provinceId } = await params;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    
    const response = await fetch(`${backendUrl}/api/shipping/cities/${provinceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { message: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
} 