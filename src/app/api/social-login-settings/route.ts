import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const socialSettingsSchema = z.object({
  googleEnabled: z.boolean().optional(),
  googleClientId: z.string().nullable().optional(),
  googleClientSecret: z.string().nullable().optional(),
  googleRedirectUri: z.string().nullable().optional(),
  facebookEnabled: z.boolean().optional(),
  facebookAppId: z.string().nullable().optional(),
  facebookAppSecret: z.string().nullable().optional(),
  facebookRedirectUri: z.string().nullable().optional(),
  telegramEnabled: z.boolean().optional(),
  telegramBotName: z.string().nullable().optional(),
  telegramBotToken: z.string().nullable().optional(),
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
      telegramBotToken: settings?.telegramBotToken ? (session?.user?.role === 'ADMIN' ? settings.telegramBotToken : '••••••••') : null,
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
      return NextResponse.json({ error: 'Invalid data', details: validatedData.error.format() }, { status: 400 });
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
      telegramEnabled,
      telegramBotName,
      telegramBotToken,
      allowAccountLinking,
    } = validatedData.data;

    // Get existing settings
    // @ts-expect-error - Prisma client may need regeneration
    let settings = await db.socialLoginSettings?.findFirst();

    const updateData: Record<string, unknown> = {};
    
    if (googleEnabled !== undefined) updateData.googleEnabled = googleEnabled;
    if (googleClientId !== undefined) updateData.googleClientId = googleClientId;
    if (googleClientSecret !== undefined && googleClientSecret !== '••••••••') {
      updateData.googleClientSecret = googleClientSecret;
    }
    if (googleRedirectUri !== undefined) updateData.googleRedirectUri = googleRedirectUri;
    
    if (facebookEnabled !== undefined) updateData.facebookEnabled = facebookEnabled;
    if (facebookAppId !== undefined) updateData.facebookAppId = facebookAppId;
    if (facebookAppSecret !== undefined && facebookAppSecret !== '••••••••') {
      updateData.facebookAppSecret = facebookAppSecret;
    }
    if (facebookRedirectUri !== undefined) updateData.facebookRedirectUri = facebookRedirectUri;
    
    if (telegramEnabled !== undefined) updateData.telegramEnabled = telegramEnabled;
    if (telegramBotName !== undefined) updateData.telegramBotName = telegramBotName;
    if (telegramBotToken !== undefined && telegramBotToken !== '••••••••') {
      updateData.telegramBotToken = telegramBotToken;
    }

    if (allowAccountLinking !== undefined) updateData.allowAccountLinking = allowAccountLinking;

    if (settings) {
      settings = await db.socialLoginSettings?.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
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

    if (provider === 'telegram') {
      if (!settings.telegramEnabled) {
        return NextResponse.json({ valid: false, error: 'Telegram login is disabled' });
      }
      if (!settings.telegramBotName || !settings.telegramBotToken) {
        return NextResponse.json({ valid: false, error: 'Telegram credentials not configured' });
      }
      return NextResponse.json({ 
        valid: true, 
        message: 'Telegram configuration is valid',
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
