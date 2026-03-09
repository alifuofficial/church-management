import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface TwilioMessage {
  sid: string;
  status: string;
  body?: string;
  error_code?: string | null;
  error_message?: string | null;
}

// Send SMS via Twilio
async function sendTwilioSms(
  accountSid: string,
  authToken: string,
  fromNumber: string,
  toNumber: string,
  message: string
): Promise<TwilioMessage> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append('From', fromNumber);
  formData.append('To', toNumber);
  formData.append('Body', message);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to send SMS');
  }

  return data;
}

// POST - Send SMS message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, templateId, userIds, eventType, entityId } = body;

    // Get Twilio configuration
    const settings = await db.setting.findMany({
      where: {
        key: { in: ['twilioAccountSid', 'twilioAuthToken', 'twilioPhoneNumber', 'smsEnabled'] }
      }
    });

    const config: Record<string, string> = {};
    settings.forEach(s => { config[s.key] = s.value; });

    if (config.smsEnabled !== 'true') {
      return NextResponse.json({ error: 'SMS is not enabled' }, { status: 400 });
    }

    if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioPhoneNumber) {
      return NextResponse.json({ error: 'Twilio configuration is incomplete' }, { status: 400 });
    }

    // Determine recipients
    let recipients: { phone: string; userId?: string }[] = [];

    if (to) {
      // Single recipient
      recipients = [{ phone: to }];
    } else if (userIds && Array.isArray(userIds)) {
      // Multiple users by ID
      const users = await db.user.findMany({
        where: { 
          id: { in: userIds },
          smsOptIn: true,
          phone: { not: null }
        },
        select: { id: true, phone: true }
      });
      recipients = users
        .filter(u => u.phone)
        .map(u => ({ phone: u.phone!, userId: u.id }));
    } else if (eventType === 'event_reminder' && entityId) {
      // Event registrants
      const registrations = await db.registration.findMany({
        where: { eventId: entityId },
        include: {
          user: {
            select: { id: true, phone: true, smsOptIn: true }
          }
        }
      });
      recipients = registrations
        .filter(r => r.user.phone && r.user.smsOptIn)
        .map(r => ({ phone: r.user.phone!, userId: r.user.id }));
    } else if (eventType === 'all_members') {
      // All members with SMS opt-in
      const users = await db.user.findMany({
        where: {
          smsOptIn: true,
          phone: { not: null },
          isActive: true
        },
        select: { id: true, phone: true }
      });
      recipients = users.map(u => ({ phone: u.phone!, userId: u.id }));
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No valid recipients found' }, { status: 400 });
    }

    // Send messages
    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        const result = await sendTwilioSms(
          config.twilioAccountSid,
          config.twilioAuthToken,
          config.twilioPhoneNumber,
          recipient.phone,
          message
        );

        // Log the SMS
        await db.smsLog.create({
          data: {
            phone: recipient.phone,
            message,
            status: result.status,
            sid: result.sid,
            templateId: templateId || null,
          }
        });

        results.push({ phone: recipient.phone, status: 'sent', sid: result.sid });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ phone: recipient.phone, error: errorMessage });

        // Log failed SMS
        await db.smsLog.create({
          data: {
            phone: recipient.phone,
            message,
            status: 'failed',
            errorMessage,
            templateId: templateId || null,
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send SMS' },
      { status: 500 }
    );
  }
}

// GET - Test SMS configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testPhone = searchParams.get('phone');

    if (!testPhone) {
      return NextResponse.json({ error: 'Phone number is required for test' }, { status: 400 });
    }

    // Get Twilio configuration
    const settings = await db.setting.findMany({
      where: {
        key: { in: ['twilioAccountSid', 'twilioAuthToken', 'twilioPhoneNumber', 'smsEnabled'] }
      }
    });

    const config: Record<string, string> = {};
    settings.forEach(s => { config[s.key] = s.value; });

    if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioPhoneNumber) {
      return NextResponse.json({ error: 'Twilio configuration is incomplete' }, { status: 400 });
    }

    // Send test message
    const testMessage = `Test message from ${config.twilioPhoneNumber}. SMS configuration is working correctly!`;

    const result = await sendTwilioSms(
      config.twilioAccountSid,
      config.twilioAuthToken,
      config.twilioPhoneNumber,
      testPhone,
      testMessage
    );

    // Log the test SMS
    await db.smsLog.create({
      data: {
        phone: testPhone,
        message: testMessage,
        status: result.status,
        sid: result.sid,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Test SMS sent successfully',
      sid: result.sid,
      status: result.status
    });
  } catch (error) {
    console.error('Error testing SMS:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test SMS' },
      { status: 500 }
    );
  }
}
