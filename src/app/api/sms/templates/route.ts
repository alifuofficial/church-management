import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Retrieve all SMS templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const triggerType = searchParams.get('triggerType');
    const enabledOnly = searchParams.get('enabledOnly') === 'true';

    const where: { triggerType?: string; isEnabled?: boolean } = {};
    if (triggerType) where.triggerType = triggerType;
    if (enabledOnly) where.isEnabled = true;

    const templates = await db.smsNotificationTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching SMS templates:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS templates' }, { status: 500 });
  }
}

// POST - Create new SMS template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, triggerType, triggerOffset, isEnabled, template, recipientType } = body;

    if (!name || !triggerType || !template) {
      return NextResponse.json(
        { error: 'Name, trigger type, and template are required' },
        { status: 400 }
      );
    }

    const newTemplate = await db.smsNotificationTemplate.create({
      data: {
        name,
        triggerType,
        triggerOffset: triggerOffset || 0,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        template,
        recipientType: recipientType || 'registrants',
      },
    });

    return NextResponse.json(newTemplate);
  } catch (error) {
    console.error('Error creating SMS template:', error);
    return NextResponse.json({ error: 'Failed to create SMS template' }, { status: 500 });
  }
}

// PUT - Update SMS template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, triggerType, triggerOffset, isEnabled, template, recipientType } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const updateData: {
      name?: string;
      triggerType?: string;
      triggerOffset?: number;
      isEnabled?: boolean;
      template?: string;
      recipientType?: string;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (triggerType !== undefined) updateData.triggerType = triggerType;
    if (triggerOffset !== undefined) updateData.triggerOffset = triggerOffset;
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
    if (template !== undefined) updateData.template = template;
    if (recipientType !== undefined) updateData.recipientType = recipientType;

    const updatedTemplate = await db.smsNotificationTemplate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating SMS template:', error);
    return NextResponse.json({ error: 'Failed to update SMS template' }, { status: 500 });
  }
}

// DELETE - Delete SMS template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    await db.smsNotificationTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting SMS template:', error);
    return NextResponse.json({ error: 'Failed to delete SMS template' }, { status: 500 });
  }
}
