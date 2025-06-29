import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://agromarfeed-backend.vercel.app';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Frontend: Current user request received');
    console.log('User Agent:', request.headers.get('user-agent'));
    console.log('Origin:', request.headers.get('origin'));
    console.log('Referer:', request.headers.get('referer'));
    console.log('Cookies from request:', request.headers.get('cookie'));
    
    // Extract session cookie specifically
    const cookies = request.headers.get('cookie') || '';
    const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('agromarfeed.sid='));
    console.log('Session cookie found:', sessionCookie ? 'Yes' : 'No');
    
    const response = await fetch(`${BACKEND_URL}/api/auth/current-user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cookie': cookies,
        'User-Agent': request.headers.get('user-agent') || '',
        'Origin': request.headers.get('origin') || '',
        'Referer': request.headers.get('referer') || '',
        "ngrok-skip-browser-warning": "true"
      },
    });

    const data = await response.json();
    console.log('📡 Backend response status:', response.status);
    console.log('📡 Backend response data:', data);
    
    // Forward any cookies from backend
    const responseHeaders = new Headers();
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('🍪 Setting cookie from backend:', setCookieHeader);
      responseHeaders.set('set-cookie', setCookieHeader);
    }
    
    // Add cache control headers to prevent caching
    responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');
    
    // Add CORS headers for OAuth
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');
    responseHeaders.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('❌ Error in current-user API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 