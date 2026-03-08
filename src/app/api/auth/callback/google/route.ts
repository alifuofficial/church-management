import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Handle Google OAuth callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/auth?error=${error}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/auth?error=no_code', request.url));
    }

    const settings = await db.socialLoginSettings.findFirst();

    if (!settings || !settings.googleEnabled || !settings.googleClientId || !settings.googleClientSecret) {
      return NextResponse.redirect(new URL('/auth?error=google_not_configured', request.url));
    }

    const redirectUri = settings.googleRedirectUri || 
      `${new URL(request.url).origin}/api/auth/callback/google`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: settings.googleClientId,
        client_secret: settings.googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/auth?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const { access_token, id_token, refresh_token, expires_in } = tokenData;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(new URL('/auth?error=user_info_failed', request.url));
    }

    const userInfo = await userInfoResponse.json();
    const { sub: googleId, email, name, picture } = userInfo;

    if (!email) {
      return NextResponse.redirect(new URL('/auth?error=no_email', request.url));
    }

    // Check if OAuth account already exists
    let oauthAccount = await db.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleId,
        },
      },
      include: { user: true },
    });

    let user;

    if (oauthAccount) {
      // Update existing OAuth account with new tokens
      user = oauthAccount.user;
      await db.oAuthAccount.update({
        where: { id: oauthAccount.id },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token || oauthAccount.refreshToken,
          expiresAt: new Date(Date.now() + expires_in * 1000),
          idToken,
        },
      });
    } else {
      // Check if user with this email already exists
      user = await db.user.findUnique({ where: { email } });

      if (!user) {
        // Create new user
        user = await db.user.create({
          data: {
            email,
            name,
            image: picture,
            isVerified: true, // Email is verified by Google
            role: 'VISITOR',
          },
        });
      } else if (settings.allowAccountLinking) {
        // Link OAuth account to existing user
      } else {
        return NextResponse.redirect(new URL('/auth?error=email_exists', request.url));
      }

      // Create OAuth account
      await db.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: 'google',
          providerAccountId: googleId,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: new Date(Date.now() + expires_in * 1000),
          idToken,
        },
      });
    }

    // Create a simple session (in production, use proper session management)
    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Set a simple auth cookie (in production, use secure session tokens)
    response.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    return NextResponse.redirect(new URL('/auth?error=google_callback_error', request.url));
  }
}
