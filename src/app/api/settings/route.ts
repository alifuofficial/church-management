import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const settingsSchema = z.record(z.string(), z.any());

// GET - Retrieve all settings
export async function GET() {
  console.log('GET /api/settings - Fetching settings');
  try {
    const settings = await db.setting.findMany();
    
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

// POST - Save settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('POST /api/settings - Session:', session ? { user: session?.user?.email, role: (session?.user as any)?.role } : 'No session');
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      console.warn('POST /api/settings - Unauthorized attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    console.log('POST /api/settings - Body keys:', Object.keys(body));
    const validation = settingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    
    // Update or create each setting
    const updates = Object.entries(body as Record<string, any>).map(async ([key, value]) => {
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
}

// DELETE - Clear all settings
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await db.setting.deleteMany();
    
    return NextResponse.json({ success: true, message: 'All settings cleared' });
  } catch (error) {
    console.error('Error clearing settings:', error);
    return NextResponse.json({ error: 'Failed to clear settings' }, { status: 500 });
  }
}
