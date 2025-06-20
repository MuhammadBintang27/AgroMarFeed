import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    const data = await response.json();
    
    // Forward cookies from backend to frontend
    const responseHeaders = new Headers();
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders.set('set-cookie', setCookieHeader);
    }
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Error in logout API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 