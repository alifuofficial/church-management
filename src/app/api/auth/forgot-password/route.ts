import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  sendEmail, 
  getEmailSettings, 
  createResetPasswordEmailHtml, 
  createResetPasswordEmailText 
} from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    // For security, don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists for this email, you will receive a password reset link shortly.',
      });
    }

    // Generate reset token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // Update user with reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expiresAt,
      },
    });

    // Check if email settings are configured
    const emailSettings = await getEmailSettings();
    
    // In dev, log the token regardless
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Password reset link for ${email}: http://localhost:3000/reset-password?token=${token}`);
    }

    if (!emailSettings) {
      return NextResponse.json({
        success: true,
        message: 'Reset token generated (check console in development). Email system not configured.',
        _devToken: process.env.NODE_ENV === 'development' ? token : undefined,
      });
    }

    // Send reset email
    const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const churchName = emailSettings.smtpFromName || emailSettings.mailchimpFromName || 'Grace Community Church';
    
    const emailHtml = createResetPasswordEmailHtml(token, churchName, siteUrl);
    const emailText = createResetPasswordEmailText(token, churchName, siteUrl);

    const result = await sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html: emailHtml,
      text: emailText,
    });

    if (!result.success) {
      console.error('Failed to send reset email:', result.error);
      return NextResponse.json({
        success: true, // Still return true for security
        message: 'Reset initiated. There was an issue sending the email, please contact support.',
        _devToken: process.env.NODE_ENV === 'development' ? token : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    console.error('Error in forgot-password API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
