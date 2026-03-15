import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const socialSettingsSchema = z.object({
  googleEnabled: z.boolean().optional(),
  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),
  googleRedirectUri: z.string().optional(),
  facebookEnabled: z.boolean().optional(),
  facebookAppId: z.string().optional(),
  facebookAppSecret: z.string().optional(),
  facebookRedirectUri: z.string().optional(),
  allowAccountLinking: z.boolean().optional(),
});

// GET - Get social login settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // @ts-expect-error - Prisma client may need regeneration
    let settings = await db.socialLoginSettings?.findFirst();

    // Create default settings if none exist
    if (!settings) {
      // @ts-expect-error - Prisma client may need regeneration
      settings = await db.socialLoginSettings?.create({
        data: {
          googleEnabled: false,
          facebookEnabled: false,
          allowAccountLinking: true,
        },
      });
    }

    // Mask sensitive data if not admin
    const maskedSettings = {
      ...settings,
      googleClientSecret: settings?.googleClientSecret ? (session?.user?.role === 'ADMIN' ? settings.googleClientSecret : '••••••••') : null,
      facebookAppSecret: settings?.facebookAppSecret ? (session?.user?.role === 'ADMIN' ? settings.facebookAppSecret : '••••••••') : null,
    };

    return NextResponse.json(maskedSettings);
  } catch (error) {
    console.error('Error fetching social login settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social login settings' },
      { status: 500 }
    );
  }
}

// PUT - Update social login settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = socialSettingsSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json({ error: 'Invalid data', details: validatedData.error.errors }, { status: 400 });
    }

    const {
      googleEnabled,
      googleClientId,
      googleClientSecret,
      googleRedirectUri,
      facebookEnabled,
      facebookAppId,
      facebookAppSecret,
      facebookRedirectUri,
      allowAccountLinking,
    } = validatedData.data;

    // Get existing settings
    // @ts-expect-error - Prisma client may need regeneration
    let settings = await db.socialLoginSettings?.findFirst();

    const updateData: Record<string, unknown> = {};
    
    if (googleEnabled !== undefined) updateData.googleEnabled = googleEnabled;
    if (googleClientId !== undefined) updateData.googleClientId = googleClientId;
    if (googleClientSecret && googleClientSecret !== '••••••••') {
      updateData.googleClientSecret = googleClientSecret;
    }
    if (googleRedirectUri !== undefined) updateData.googleRedirectUri = googleRedirectUri;
    
    if (facebookEnabled !== undefined) updateData.facebookEnabled = facebookEnabled;
    if (facebookAppId !== undefined) updateData.facebookAppId = facebookAppId;
    if (facebookAppSecret && facebookAppSecret !== '••••••••') {
      updateData.facebookAppSecret = facebookAppSecret;
    }
    if (facebookRedirectUri !== undefined) updateData.facebookRedirectUri = facebookRedirectUri;
    
    if (allowAccountLinking !== undefined) updateData.allowAccountLinking = allowAccountLinking;

    if (settings) {
      // @ts-expect-error - Prisma client may need regeneration
      settings = await db.socialLoginSettings?.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      // @ts-expect-error - Prisma client may need regeneration
      settings = await db.socialLoginSettings?.create({
        data: updateData as Record<string, unknown>,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating social login settings:', error);
    return NextResponse.json(
      { error: 'Failed to update social login settings' },
      { status: 500 }
    );
  }
}

// POST - Test social login configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider } = body;

    // @ts-expect-error - Prisma client may need regeneration
    const settings = await db.socialLoginSettings?.findFirst();

    if (!settings) {
      return NextResponse.json(
        { valid: false, error: 'Settings not configured' },
        { status: 400 }
      );
    }

    if (provider === 'google') {
      if (!settings.googleEnabled) {
        return NextResponse.json({ valid: false, error: 'Google login is disabled' });
      }
      if (!settings.googleClientId || !settings.googleClientSecret) {
        return NextResponse.json({ valid: false, error: 'Google credentials not configured' });
      }
      return NextResponse.json({ 
        valid: true, 
        message: 'Google OAuth configuration is valid',
        redirectUri: settings.googleRedirectUri 
      });
    }

    if (provider === 'facebook') {
      if (!settings.facebookEnabled) {
        return NextResponse.json({ valid: false, error: 'Facebook login is disabled' });
      }
      if (!settings.facebookAppId || !settings.facebookAppSecret) {
        return NextResponse.json({ valid: false, error: 'Facebook credentials not configured' });
      }
      return NextResponse.json({ 
        valid: true, 
        message: 'Facebook OAuth configuration is valid',
        redirectUri: settings.facebookRedirectUri 
      });
    }

    return NextResponse.json(
      { valid: false, error: 'Unknown provider' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error testing social login:', error);
    return NextResponse.json(
      { error: 'Failed to test social login' },
      { status: 500 }
    );
  }
}
