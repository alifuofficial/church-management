import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const groups = await db.smallGroup.findMany({
      where: { isActive: true },
      include: {
        leader: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: { members: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      name, description, type, location, meetingDay, meetingTime, 
      maxMembers, imageUrl, country, city, timezone, 
      denomination, faithStatus, localChurch, interests 
    } = body;

    const group = await db.smallGroup.create({
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
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
