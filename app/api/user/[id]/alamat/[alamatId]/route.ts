import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; alamatId: string }> }
) {
  try {
    const { id, alamatId } = await params;
    const body = await request.json();
    
    const response = await fetch(`${API_BASE}/api/users/${id}/alamat/${alamatId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
        "ngrok-skip-browser-warning": "true"
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in user address edit API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; alamatId: string }> }
) {
  try {
    const { id, alamatId } = await params;
    
    const response = await fetch(`${API_BASE}/api/users/${id}/alamat/${alamatId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
        "ngrok-skip-browser-warning": "true"
      },
      credentials: 'include',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in user address delete API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 