import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get email settings
export async function GET() {
  try {
    let settings = await db.emailSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await db.emailSettings.create({
        data: {
          provider: 'smtp',
        },
      });
    }

    // Mask sensitive data
    const maskedSettings = {
      ...settings,
      smtpPassword: settings.smtpPassword ? '••••••••' : null,
      mailchimpApiKey: settings.mailchimpApiKey ? '••••••••' : null,
    };

    return NextResponse.json(maskedSettings);
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email settings' },
      { status: 500 }
    );
  }
}

// PUT - Update email settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      provider,
      isActive,
      // SMTP Settings
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpFromEmail,
      smtpFromName,
      smtpSecure,
      // Mailchimp Settings
      mailchimpApiKey,
      mailchimpServer,
      mailchimpListId,
      mailchimpFromEmail,
      mailchimpFromName,
      // Default settings
      defaultFrequency,
      includeUnsubscribeLink,
      trackOpens,
      trackClicks,
    } = body;

    // Get existing settings
    let settings = await db.emailSettings.findFirst();

    const updateData: Record<string, unknown> = {};
    
    if (provider !== undefined) updateData.provider = provider;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (smtpHost !== undefined) updateData.smtpHost = smtpHost;
    if (smtpPort !== undefined) updateData.smtpPort = smtpPort;
    if (smtpUser !== undefined) updateData.smtpUser = smtpUser;
    if (smtpPassword && smtpPassword !== '••••••••') {
      updateData.smtpPassword = smtpPassword;
    }
    if (smtpFromEmail !== undefined) updateData.smtpFromEmail = smtpFromEmail;
    if (smtpFromName !== undefined) updateData.smtpFromName = smtpFromName;
    if (smtpSecure !== undefined) updateData.smtpSecure = smtpSecure;
    if (mailchimpApiKey && mailchimpApiKey !== '••••••••') {
      updateData.mailchimpApiKey = mailchimpApiKey;
    }
    if (mailchimpServer !== undefined) updateData.mailchimpServer = mailchimpServer;
    if (mailchimpListId !== undefined) updateData.mailchimpListId = mailchimpListId;
    if (mailchimpFromEmail !== undefined) updateData.mailchimpFromEmail = mailchimpFromEmail;
    if (mailchimpFromName !== undefined) updateData.mailchimpFromName = mailchimpFromName;
    if (defaultFrequency !== undefined) updateData.defaultFrequency = defaultFrequency;
    if (includeUnsubscribeLink !== undefined) updateData.includeUnsubscribeLink = includeUnsubscribeLink;
    if (trackOpens !== undefined) updateData.trackOpens = trackOpens;
    if (trackClicks !== undefined) updateData.trackClicks = trackClicks;

    if (settings) {
      settings = await db.emailSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      settings = await db.emailSettings.create({
        data: updateData as Record<string, unknown>,
      });
    }

    // Mask sensitive data in response
    const maskedSettings = {
      ...settings,
      smtpPassword: settings.smtpPassword ? '••••••••' : null,
      mailchimpApiKey: settings.mailchimpApiKey ? '••••••••' : null,
    };

    return NextResponse.json(maskedSettings);
  } catch (error) {
    console.error('Error updating email settings:', error);
    return NextResponse.json(
      { error: 'Failed to update email settings' },
      { status: 500 }
    );
  }
}

// POST - Test email settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      );
    }

    const settings = await db.emailSettings.findFirst();

    if (!settings) {
      return NextResponse.json(
        { error: 'Email settings not configured' },
        { status: 400 }
      );
    }

    // Actually send a test email
    const { sendEmail } = await import('@/lib/email');
    
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Test Email</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; text-align: center;">Email Configuration Successful!</h2>
                    <p style="margin: 0 0 20px; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                      Congratulations! Your email settings are configured correctly. This is a test email to confirm that your SMTP/Mailchimp settings are working properly.
                    </p>
                    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; text-align: center;">
                      <p style="margin: 0; color: #166534; font-weight: 500;">✓ Email delivery successful</p>
                      <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Sent via ${settings.provider.toUpperCase()}</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © ${new Date().getFullYear()} Church Management System. This was a test email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to: testEmail,
      subject: 'Test Email - Configuration Successful',
      html: testHtml,
      text: 'Test Email - Configuration Successful\n\nCongratulations! Your email settings are configured correctly.',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send test email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${testEmail} via ${settings.provider}`,
      provider: settings.provider,
    });
  } catch (error) {
    console.error('Error testing email settings:', error);
    return NextResponse.json(
      { error: 'Failed to test email settings' },
      { status: 500 }
    );
  }
}
