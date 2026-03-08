import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Retrieve all settings
export async function GET() {
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
    const body = await request.json();
    
    // Update or create each setting
    const updates = Object.entries(body).map(async ([key, value]) => {
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
    await db.setting.deleteMany();
    
    return NextResponse.json({ success: true, message: 'All settings cleared' });
  } catch (error) {
    console.error('Error clearing settings:', error);
    return NextResponse.json({ error: 'Failed to clear settings' }, { status: 500 });
  }
}
