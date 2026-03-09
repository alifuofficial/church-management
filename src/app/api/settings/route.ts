import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth, withAdmin, AuthContext } from '@/lib/api-auth';

// GET - Retrieve all settings (public for live site, but sensitive settings filtered)
export async function GET(request: NextRequest) {
  try {
    const settings = await db.setting.findMany({
      where: {
        NOT: {
          key: {
            in: [
              'stripeSecretKey',
              'smtpPassword',
              'mailchimpApiKey',
              'googleClientSecret',
              'facebookAppSecret',
            ]
          }
        }
      }
    });
    
    // Convert array to object
    const settingsObj: Record<string, unknown> = {};
    settings.forEach(setting => {
      // Try to parse JSON values (like features object)
      try {
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObj[setting.key] = setting.value;
      }
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST - Save settings (admin only)
export const POST = withAdmin(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const body = await request.json();
    
    // Sensitive keys that should be encrypted or handled specially
    const sensitiveKeys = [
      'stripeSecretKey',
      'smtpPassword',
      'mailchimpApiKey',
      'googleClientSecret',
      'facebookAppSecret',
    ];
    
    // Update or create each setting
    const updates = Object.entries(body).map(async ([key, value]) => {
      // Log changes to sensitive keys
      if (sensitiveKeys.includes(key)) {
        console.log(`[Settings] Admin ${auth.user.email} updated sensitive setting: ${key}`);
      }
      
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      return db.setting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue }
      });
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
});

// DELETE - Clear all settings (admin only, dangerous operation)
export const DELETE = withAdmin(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    // Log this dangerous operation
    console.log(`[Settings] Admin ${auth.user.email} is clearing all settings`);
    
    // Don't actually delete all settings, just reset to defaults
    // This is safer than a complete deletion
    const protectedKeys = ['stripeSecretKey', 'smtpPassword', 'mailchimpApiKey'];
    
    await db.setting.deleteMany({
      where: {
        NOT: {
          key: { in: protectedKeys }
        }
      }
    });
    
    return NextResponse.json({ success: true, message: 'Settings cleared' });
  } catch (error) {
    console.error('Error clearing settings:', error);
    return NextResponse.json({ error: 'Failed to clear settings' }, { status: 500 });
  }
});
