import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://agromarfeed-backend.vercel.app';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 OAuth session transfer requested from frontend');
    
    const response = await fetch(`${BACKEND_URL}/api/auth/oauth-session-transfer`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        'User-Agent': request.headers.get('user-agent') || '',
        'Origin': request.headers.get('origin') || '',
        'Referer': request.headers.get('referer') || '',
        "ngrok-skip-browser-warning": "true"
      },
    });

    const data = await response.json();
    console.log('📡 Backend session transfer response:', data);
    
    // Forward any cookies from backend
    const responseHeaders = new Headers();
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('🍪 Setting cookie from backend session transfer:', setCookieHeader);
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
    console.error('❌ Error in OAuth session transfer:', error);
    return NextResponse.json(
      { message: 'Session transfer failed' },
      { status: 500 }
    );
  }
} 