import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://agromarfeed-backend.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 Validating OAuth token from frontend');
    
    const response = await fetch(`${BACKEND_URL}/api/auth/validate-oauth-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await response.json();
    console.log('📡 Backend token validation response:', data);
    
    // Forward any cookies from backend
    const responseHeaders = new Headers();
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('🍪 Setting cookie from token validation:', setCookieHeader);
      responseHeaders.set('set-cookie', setCookieHeader);
    }
    
    // Add cache control headers
    responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');
    
    // Add CORS headers
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');
    responseHeaders.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('❌ Error in OAuth token validation:', error);
    return NextResponse.json(
      { message: 'Token validation failed' },
      { status: 500 }
    );
  }
} 