import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    console.log('Frontend: Current user request received');
    console.log('Cookies from request:', request.headers.get('cookie'));
    
    const response = await fetch(`${BACKEND_URL}/api/auth/current-user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        "ngrok-skip-browser-warning": "true"
      },
    });

    const data = await response.json();
    console.log('Backend response:', data);
    
    // Forward any cookies from backend
    const responseHeaders = new Headers();
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('Setting cookie from backend:', setCookieHeader);
      responseHeaders.set('set-cookie', setCookieHeader);
    }
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('Error in current-user API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 