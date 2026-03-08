import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    
    if (userId) {
      where.userId = userId;
    }
    if (eventId) {
      where.eventId = eventId;
    }

    const registrations = await db.registration.findMany({
      where,
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          }
        }
      },
      orderBy: { registeredAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if already registered
    const existing = await db.registration.findUnique({
      where: {
        eventId_userId: {
          eventId: body.eventId,
          userId: body.userId,
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }

    // Get event for zoom link
    const event = await db.event.findUnique({
      where: { id: body.eventId }
    });

    const registration = await db.registration.create({
      data: {
        eventId: body.eventId,
        userId: body.userId,
        status: 'REGISTERED',
        notes: body.notes,
        zoomJoinUrl: event?.zoomJoinUrl,
      },
      include: { event: true }
    });

    // Update event registration count
    await db.event.update({
      where: { id: body.eventId },
      data: { registrationCount: { increment: 1 } }
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }

    const registration = await db.registration.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    });

    // Update event registration count
    await db.event.update({
      where: { id: registration.eventId },
      data: { registrationCount: { decrement: 1 } }
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return NextResponse.json({ error: 'Failed to cancel registration' }, { status: 500 });
  }
}
