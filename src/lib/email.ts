import nodemailer from 'nodemailer';
import { db } from './db';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailSettings {
  provider: string;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPassword: string | null;
  smtpFromEmail: string | null;
  smtpFromName: string | null;
  smtpSecure: boolean;
  mailchimpApiKey: string | null;
  mailchimpServer: string | null;
  mailchimpFromEmail: string | null;
  mailchimpFromName: string | null;
}

export async function getEmailSettings(): Promise<EmailSettings | null> {
  const settings = await db.emailSettings.findFirst();
  return settings;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const settings = await getEmailSettings();
  
  if (!settings) {
    return { success: false, error: 'Email settings not configured' };
  }

  if (settings.provider === 'smtp') {
    return sendViaSMTP(options, settings);
  } else if (settings.provider === 'mailchimp') {
    return sendViaMailchimp(options, settings);
  }

  return { success: false, error: 'Unknown email provider' };
}

async function sendViaSMTP(options: EmailOptions, settings: EmailSettings): Promise<{ success: boolean; error?: string }> {
  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword || !settings.smtpFromEmail) {
    return { success: false, error: 'SMTP settings incomplete. Please configure host, user, password, and from email.' };
  }

  try {
    // Determine the correct port and secure setting
    const port = settings.smtpPort || 587;
    
    // Use the stored setting if available, otherwise fallback to port-based logic
    // For port 465, use implicit TLS (secure: true)
    // For port 587 or others, use STARTTLS (secure: false with requireTLS)
    const secure = settings.smtpSecure !== null ? settings.smtpSecure : (port === 465);
    
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: port,
      secure: secure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
      // For STARTTLS (port 587), require TLS upgrade
      requireTLS: !secure,
      tls: {
        // Do not fail on invalid certs (for testing)
        rejectUnauthorized: false,
      },
      // Connection timeout
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify connection before sending
    await transporter.verify();

    await transporter.sendMail({
      from: `"${settings.smtpFromName || 'Church'}" <${settings.smtpFromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('SMTP error:', error);
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to send email via SMTP';
    
    if (error instanceof Error) {
      if (error.message.includes('wrong version number') || error.message.includes('SSL routines')) {
        errorMessage = 'SSL/TLS connection error. If using port 587, ensure STARTTLS is supported. If using port 465, enable SSL/TLS.';
      } else if (error.message.includes('Invalid login') || error.message.includes('Authentication failed')) {
        errorMessage = 'SMTP authentication failed. Please check your username and password.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Could not connect to SMTP server. Please check the host and port.';
      } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
        errorMessage = 'Connection to SMTP server timed out. Please check the host and port.';
      } else if (error.message.includes('self signed certificate')) {
        errorMessage = 'SSL certificate error. Please check your SMTP server configuration.';
      }
    }
    
    return { success: false, error: errorMessage };
  }
}

async function sendViaMailchimp(options: EmailOptions, settings: EmailSettings): Promise<{ success: boolean; error?: string }> {
  if (!settings.mailchimpApiKey || !settings.mailchimpServer || !settings.mailchimpFromEmail) {
    return { success: false, error: 'Mailchimp settings incomplete' };
  }

  try {
    // Mailchimp Transactional API (formerly Mandrill)
    const response = await fetch(`https://${settings.mailchimpServer}.api.mailchimp.com/3.0/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${settings.mailchimpApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          from_email: settings.mailchimpFromEmail,
          from_name: settings.mailchimpFromName || 'Church',
          to: [{ email: options.to, type: 'to' }],
          subject: options.subject,
          html: options.html,
          text: options.text,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Mailchimp error:', error);
      return { success: false, error: 'Failed to send email via Mailchimp' };
    }

    return { success: true };
  } catch (error) {
    console.error('Mailchimp error:', error);
    return { success: false, error: 'Failed to send email via Mailchimp' };
  }
}

export function generateVerificationCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export function createVerificationEmailHtml(code: string, churchName: string = 'Grace Community Church'): string {
  return `
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
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">${churchName}</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; text-align: center;">Verify Your Email Address</h2>
                  <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                    Thank you for registering! Please use the verification code below to complete your registration.
                  </p>
                  
                  <!-- Verification Code -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background-color: #fef3c7; border: 2px dashed #f59e0b; border-radius: 8px; padding: 20px 40px;">
                              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #92400e; font-family: 'Courier New', monospace;">
                                ${code}
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; text-align: center;">
                    This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} ${churchName}. All rights reserved.
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
}

export function createVerificationEmailText(code: string, churchName: string = 'Grace Community Church'): string {
  return `
${churchName}
================

Verify Your Email Address

Thank you for registering! Please use the verification code below to complete your registration.

Your verification code: ${code}

This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.

© ${new Date().getFullYear()} ${churchName}. All rights reserved.
  `.trim();
}

export function createResetPasswordEmailHtml(token: string, churchName: string = 'Grace Community Church', siteUrl: string = 'http://localhost:3000'): string {
  const resetUrl = `${siteUrl}/reset-password?token=${token}`;
  return `
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
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">${churchName}</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; text-align: center;">Reset Your Password</h2>
                  <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                    We received a request to reset your password. Click the button below to choose a new one.
                  </p>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; text-align: center;">
                    If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.
                  </p>
                  <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px; text-align: center; word-break: break-all;">
                    Button not working? Copy and paste this link: <br>
                    <a href="${resetUrl}" style="color: #4f46e5; text-decoration: underline;">${resetUrl}</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} ${churchName}. All rights reserved.
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
}

export function createResetPasswordEmailText(token: string, churchName: string = 'Grace Community Church', siteUrl: string = 'http://localhost:3000'): string {
  const resetUrl = `${siteUrl}/reset-password?token=${token}`;
  return `
${churchName}
================

Reset Your Password

We received a request to reset your password. Click the link below to choose a new one:

${resetUrl}

If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.

© ${new Date().getFullYear()} ${churchName}. All rights reserved.
  `.trim();
}
