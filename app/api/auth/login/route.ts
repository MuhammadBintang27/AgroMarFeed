import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://agromarfeed-backend.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 Frontend login API - Request received:', { email: body.email, password: body.password ? '[HIDDEN]' : 'missing' });
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    console.log('🔍 Frontend login API - Backend response status:', response.status);
    console.log('🔍 Frontend login API - Backend response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('🔍 Frontend login API - Backend response data:', data);
    
    // Create response with proper headers
    const responseHeaders = new Headers();
    
    // Forward cookies from backend to frontend
    const setCookieHeader = response.headers.get('set-cookie');
    console.log('🔍 Frontend login API - Set-Cookie header:', setCookieHeader);
    
    if (setCookieHeader) {
      // Parse and forward each cookie individually
      const cookies = setCookieHeader.split(',').map(cookie => cookie.trim());
      cookies.forEach(cookie => {
        responseHeaders.append('set-cookie', cookie);
      });
      console.log('✅ Frontend login API - Cookies forwarded successfully:', cookies.length, 'cookies');
    } else {
      console.log('⚠️ Frontend login API - No Set-Cookie header found');
    }
    
    // Add cache control headers to prevent caching
    responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');
    
    // Add CORS headers
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');
    responseHeaders.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    
    console.log('✅ Frontend login API - Returning response to client');
    return NextResponse.json(data, { 
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('❌ Frontend login API - Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
