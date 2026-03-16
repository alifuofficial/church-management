import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { 
      name, description, type, location, meetingDay, meetingTime, 
      maxMembers, imageUrl, country, city, timezone, 
      denomination, faithStatus, localChurch, interests, isActive 
    } = body;

    const group = await db.smallGroup.update({
      where: { id: params.id },
      data: {
        name,
        description,
        type,
        location,
        meetingDay,
        meetingTime,
        maxMembers: maxMembers ? parseInt(maxMembers.toString()) : null,
        imageUrl,
        country,
        city,
        timezone,
        denomination,
        faithStatus,
        localChurch,
        interests: Array.isArray(interests) ? interests.join(',') : interests,
        isActive
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if group has members before deleting or handle cascading
    // For now, we'll allow deletion
    await db.smallGroup.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}
