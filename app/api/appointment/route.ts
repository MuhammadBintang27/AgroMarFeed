import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/api/appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error in appointment POST:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const orderId = searchParams.get('order_id');
    const userId = searchParams.get('user_id');
    let url = `${API_BASE}/api/appointment`;
    
    if (orderId) {
      url += `/by-order-id?orderId=${orderId}`;
    } else if (userId) {
      url += `/by-user-id?user_id=${userId}`;
    } else if (id) {
      url += `/${id}`;
    }
    
    console.log('Fetching appointment from:', url);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error('Backend appointment API error:', res.status, res.statusText);
      const errorText = await res.text();
      console.error('Error response:', errorText);
      return NextResponse.json(
        { message: `Backend API error: ${res.status} ${res.statusText}` }, 
        { status: res.status }
      );
    }
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error in appointment GET:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 });
    const body = await req.json();
    const res = await fetch(`${API_BASE}/api/appointment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error in appointment PUT:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 });
    const res = await fetch(`${API_BASE}/api/appointment/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error in appointment DELETE:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

