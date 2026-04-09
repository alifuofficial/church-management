import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { 
      name, description, type, location, meetingDay, meetingTime, 
      maxMembers, imageUrl, country, city, timezone, 
      denomination, faithStatus, localChurch, interests, isActive 
    } = body;

    const group = await db.smallGroup.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First delete all group memberships
    await db.smallGroupMember.deleteMany({
      where: { groupId: id }
    });
    
    // Then delete the group
    await db.smallGroup.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const group = await db.smallGroup.findUnique({
      where: { id },
      include: {
        leader: {
          select: { id: true, name: true, image: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}