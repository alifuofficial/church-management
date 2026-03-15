import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const emailVerificationSettingsSchema = z.object({
  isEnabled: z.boolean().optional(),
  codeLength: z.number().min(4).max(10).optional(),
  codeExpirationMinutes: z.number().min(1).max(60).optional(),
  resendCooldownSeconds: z.number().min(10).max(300).optional(),
  maxAttempts: z.number().min(1).max(20).optional(),
  emailSubject: z.string().optional(),
  emailFromName: z.string().optional(),
});

// GET - Get email verification settings
export async function GET() {
  try {
    const settings = await db.emailVerificationSettings.findFirst();
    
    if (settings) {
      return NextResponse.json(settings);
    }
    
    // Return default settings if none exist
    return NextResponse.json({
      id: 'default',
      isEnabled: false,
      codeLength: 6,
      codeExpirationMinutes: 10,
      resendCooldownSeconds: 60,
      maxAttempts: 5,
      emailSubject: 'Verify Your Email Address',
      emailFromName: 'Church Management System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching email verification settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Update email verification settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = emailVerificationSettingsSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: 'Invalid data', details: validatedData.error.errors }, { status: 400 });
    }
    
    let settings = await db.emailVerificationSettings.findFirst();
    
    if (!settings) {
      settings = await db.emailVerificationSettings.create({
        data: {
          isEnabled: validatedData.data.isEnabled ?? false,
          codeLength: validatedData.data.codeLength ?? 6,
          codeExpirationMinutes: validatedData.data.codeExpirationMinutes ?? 10,
          resendCooldownSeconds: validatedData.data.resendCooldownSeconds ?? 60,
          maxAttempts: validatedData.data.maxAttempts ?? 5,
          emailSubject: validatedData.data.emailSubject ?? 'Verify Your Email Address',
          emailFromName: validatedData.data.emailFromName ?? 'Church',
        },
      });
    } else {
      settings = await db.emailVerificationSettings.update({
        where: { id: settings.id },
        data: {
          isEnabled: validatedData.data.isEnabled,
          codeLength: validatedData.data.codeLength,
          codeExpirationMinutes: validatedData.data.codeExpirationMinutes,
          resendCooldownSeconds: validatedData.data.resendCooldownSeconds,
          maxAttempts: validatedData.data.maxAttempts,
          emailSubject: validatedData.data.emailSubject,
          emailFromName: validatedData.data.emailFromName,
        },
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating email verification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update email verification settings' },
      { status: 500 }
    );
  }
}
