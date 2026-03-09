import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Handle Facebook OAuth callback
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

    if (!settings || !settings.facebookEnabled || !settings.facebookAppId || !settings.facebookAppSecret) {
      return NextResponse.redirect(new URL('/auth?error=facebook_not_configured', request.url));
    }

    const redirectUri = settings.facebookRedirectUri || 
      `${new URL(request.url).origin}/api/auth/callback/facebook`;

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${settings.facebookAppId}&client_secret=${settings.facebookAppSecret}&redirect_uri=${redirectUri}&code=${code}`
    );

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/auth?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in } = tokenData;

    // Get user info from Facebook
    const userInfoResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`
    );

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(new URL('/auth?error=user_info_failed', request.url));
    }

    const userInfo = await userInfoResponse.json();
    const { id: facebookId, email, name, picture } = userInfo;

    if (!email) {
      return NextResponse.redirect(new URL('/auth?error=no_email', request.url));
    }

    // Check if OAuth account already exists
    let oauthAccount = await db.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'facebook',
          providerAccountId: facebookId,
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
          expiresAt: new Date(Date.now() + expires_in * 1000),
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
            image: picture?.data?.url,
            isVerified: true, // Email is verified by Facebook
            role: 'VISITOR',
          },
        });
      } else if (!settings.allowAccountLinking) {
        return NextResponse.redirect(new URL('/auth?error=email_exists', request.url));
      }

      // Create OAuth account
      await db.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: 'facebook',
          providerAccountId: facebookId,
          accessToken: access_token,
          expiresAt: new Date(Date.now() + expires_in * 1000),
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
    console.error('Error handling Facebook OAuth callback:', error);
    return NextResponse.redirect(new URL('/auth?error=facebook_callback_error', request.url));
  }
}
