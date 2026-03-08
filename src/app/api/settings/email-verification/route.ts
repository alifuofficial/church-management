import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
      emailFromName: 'Grace Community Church',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching email verification settings:', error);
    // Return default settings on error
    return NextResponse.json({
      id: 'default',
      isEnabled: false,
      codeLength: 6,
      codeExpirationMinutes: 10,
      resendCooldownSeconds: 60,
      maxAttempts: 5,
      emailSubject: 'Verify Your Email Address',
      emailFromName: 'Grace Community Church',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

// PUT - Update email verification settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    let settings = await db.emailVerificationSettings.findFirst();
    
    if (!settings) {
      settings = await db.emailVerificationSettings.create({
        data: {
          isEnabled: body.isEnabled ?? false,
          codeLength: body.codeLength ?? 6,
          codeExpirationMinutes: body.codeExpirationMinutes ?? 10,
          resendCooldownSeconds: body.resendCooldownSeconds ?? 60,
          maxAttempts: body.maxAttempts ?? 5,
          emailSubject: body.emailSubject ?? 'Verify Your Email Address',
          emailFromName: body.emailFromName ?? 'Grace Community Church',
        },
      });
    } else {
      settings = await db.emailVerificationSettings.update({
        where: { id: settings.id },
        data: {
          isEnabled: body.isEnabled,
          codeLength: body.codeLength,
          codeExpirationMinutes: body.codeExpirationMinutes,
          resendCooldownSeconds: body.resendCooldownSeconds,
          maxAttempts: body.maxAttempts,
          emailSubject: body.emailSubject,
          emailFromName: body.emailFromName,
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
