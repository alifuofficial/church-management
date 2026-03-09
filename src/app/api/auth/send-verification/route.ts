import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, generateVerificationCode, createVerificationEmailHtml, createVerificationEmailText, getEmailSettings } from '@/lib/email';

// POST - Send verification code to user's email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userId } = body;

    if (!email && !userId) {
      return NextResponse.json(
        { error: 'Email or userId is required' },
        { status: 400 }
      );
    }

    // Get verification settings
    const verificationSettings = await db.emailVerificationSettings.findFirst();
    
    if (!verificationSettings?.isEnabled) {
      return NextResponse.json(
        { error: 'Email verification is not enabled' },
        { status: 400 }
      );
    }

    // Find user
    const user = userId 
      ? await db.user.findUnique({ where: { id: userId } })
      : await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate verification code
    const codeLength = verificationSettings.codeLength || 6;
    const code = generateVerificationCode(codeLength);
    
    // Calculate expiration time
    const expirationMinutes = verificationSettings.codeExpirationMinutes || 10;
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    // Update user with verification code - store even if email fails
    await db.user.update({
      where: { id: user.id },
      data: {
        verificationCode: code,
        verificationCodeExpires: expiresAt,
      },
    });

    // Check if email settings are configured
    const emailSettings = await getEmailSettings();
    
    if (!emailSettings) {
      // Email settings not configured - return code for testing
      console.log(`[DEV] Verification code for ${user.email}: ${code}`);
      return NextResponse.json({
        success: false,
        error: 'Email settings are not configured. Please configure SMTP in admin settings.',
        // Return code for testing purposes
        _devCode: process.env.NODE_ENV === 'development' ? code : undefined,
        expiresIn: expirationMinutes * 60,
      });
    }

    // Send verification email
    const emailHtml = createVerificationEmailHtml(code, verificationSettings.emailFromName || 'Church');
    const emailText = createVerificationEmailText(code, verificationSettings.emailFromName || 'Church');

    const result = await sendEmail({
      to: user.email,
      subject: verificationSettings.emailSubject || 'Verify Your Email Address',
      html: emailHtml,
      text: emailText,
    });

    if (!result.success) {
      console.error('Failed to send verification email:', result.error);
      console.log(`[DEV] Verification code for ${user.email}: ${code}`);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send verification email',
        // Return code for testing purposes when email fails
        _devCode: process.env.NODE_ENV === 'development' ? code : undefined,
        expiresIn: expirationMinutes * 60,
      }, { status: 200 }); // Return 200 so the verification screen still shows
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      // Return code for testing purposes
      _devCode: process.env.NODE_ENV === 'development' ? code : undefined,
      expiresIn: expirationMinutes * 60, // seconds
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
