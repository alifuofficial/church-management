import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Initiate Google OAuth flow
export async function GET(request: NextRequest) {
  try {
    const settings = await db.socialLoginSettings.findFirst();

    if (!settings || !settings.googleEnabled) {
      return NextResponse.redirect(new URL('/auth?error=google_disabled', request.url));
    }

    if (!settings.googleClientId) {
      return NextResponse.redirect(new URL('/auth?error=google_not_configured', request.url));
    }

    const redirectUri = settings.googleRedirectUri || 
      `${new URL(request.url).origin}/api/auth/callback/google`;

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', settings.googleClientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
    return NextResponse.redirect(new URL('/auth?error=google_oauth_error', request.url));
  }
}
