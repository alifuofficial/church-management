import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Retrieve SMS configuration
export async function GET() {
  try {
    const settings = await db.setting.findMany({
      where: {
        key: {
          in: ['twilioAccountSid', 'twilioAuthToken', 'twilioPhoneNumber', 'smsEnabled']
        }
      }
    });

    const config: Record<string, string> = {};
    settings.forEach(setting => {
      config[setting.key] = setting.key === 'twilioAuthToken' ? '••••••••' : setting.value;
    });

    // Add masked status for auth token
    config.hasAuthToken = settings.find(s => s.key === 'twilioAuthToken') ? 'true' : 'false';

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching SMS config:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS configuration' }, { status: 500 });
  }
}

// POST - Save SMS configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { twilioAccountSid, twilioAuthToken, twilioPhoneNumber, smsEnabled } = body;

    const updates = [];

    if (twilioAccountSid !== undefined) {
      updates.push(
        db.setting.upsert({
          where: { key: 'twilioAccountSid' },
          update: { value: twilioAccountSid },
          create: { key: 'twilioAccountSid', value: twilioAccountSid }
        })
      );
    }

    // Only update auth token if it's not masked
    if (twilioAuthToken && !twilioAuthToken.includes('•')) {
      updates.push(
        db.setting.upsert({
          where: { key: 'twilioAuthToken' },
          update: { value: twilioAuthToken },
          create: { key: 'twilioAuthToken', value: twilioAuthToken }
        })
      );
    }

    if (twilioPhoneNumber !== undefined) {
      updates.push(
        db.setting.upsert({
          where: { key: 'twilioPhoneNumber' },
          update: { value: twilioPhoneNumber },
          create: { key: 'twilioPhoneNumber', value: twilioPhoneNumber }
        })
      );
    }

    if (smsEnabled !== undefined) {
      updates.push(
        db.setting.upsert({
          where: { key: 'smsEnabled' },
          update: { value: String(smsEnabled) },
          create: { key: 'smsEnabled', value: String(smsEnabled) }
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'SMS configuration saved successfully' });
  } catch (error) {
    console.error('Error saving SMS config:', error);
    return NextResponse.json({ error: 'Failed to save SMS configuration' }, { status: 500 });
  }
}

// DELETE - Clear SMS configuration
export async function DELETE() {
  try {
    await db.setting.deleteMany({
      where: {
        key: {
          in: ['twilioAccountSid', 'twilioAuthToken', 'twilioPhoneNumber', 'smsEnabled']
        }
      }
    });

    return NextResponse.json({ success: true, message: 'SMS configuration cleared' });
  } catch (error) {
    console.error('Error clearing SMS config:', error);
    return NextResponse.json({ error: 'Failed to clear SMS configuration' }, { status: 500 });
  }
}
