import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Initiate Facebook OAuth flow
export async function GET(request: NextRequest) {
  try {
    const settings = await db.socialLoginSettings.findFirst();

    if (!settings || !settings.facebookEnabled) {
      return NextResponse.redirect(new URL('/auth?error=facebook_disabled', request.url));
    }

    if (!settings.facebookAppId) {
      return NextResponse.redirect(new URL('/auth?error=facebook_not_configured', request.url));
    }

    const redirectUri = settings.facebookRedirectUri || 
      `${new URL(request.url).origin}/api/auth/callback/facebook`;

    const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    facebookAuthUrl.searchParams.set('client_id', settings.facebookAppId);
    facebookAuthUrl.searchParams.set('redirect_uri', redirectUri);
    facebookAuthUrl.searchParams.set('response_type', 'code');
    facebookAuthUrl.searchParams.set('scope', 'email,public_profile');

    return NextResponse.redirect(facebookAuthUrl.toString());
  } catch (error) {
    console.error('Error initiating Facebook OAuth:', error);
    return NextResponse.redirect(new URL('/auth?error=facebook_oauth_error', request.url));
  }
}
