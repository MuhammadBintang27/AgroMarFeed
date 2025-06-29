import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const oauth = searchParams.get('oauth');
    
    console.log('🔄 OAuth callback received:', { oauth });
    
    if (oauth === 'success') {
      // OAuth was successful, redirect to home page
      return NextResponse.redirect(new URL('/?oauth=success', request.url));
    } else {
      // OAuth failed, redirect to login with error
      return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url));
    }
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url));
  }
} 