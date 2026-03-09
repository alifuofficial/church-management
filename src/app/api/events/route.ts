import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth, withAdmin, withOptionalAuth, AuthContext } from '@/lib/api-auth';
import { sanitizeInput } from '@/lib/auth-utils';

// GET - Retrieve events (public read)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: Record<string, unknown> = {};
    
    if (type && type !== 'all') {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (upcoming === 'true') {
      where.startDate = { gte: new Date() };
    }

    const events = await db.event.findMany({
      where,
      include: {
        eventSpeakers: {
          orderBy: { order: 'asc' }
        },
        createdBy: {
          select: { id: true, name: true }
        },
        registrations: {
          select: { id: true, userId: true, status: true }
        }
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST - Create event (admin only)
export const POST = withAdmin(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const body = await request.json();
    
    const event = await db.event.create({
      data: {
        title: sanitizeInput(body.title),
        description: body.description ? sanitizeInput(body.description) : null,
        type: body.type || 'SERVICE',
        status: body.status || 'SCHEDULED',
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        timezone: body.timezone || 'America/New_York',
        location: body.location ? sanitizeInput(body.location) : null,
        address: body.address ? sanitizeInput(body.address) : null,
        isOnline: body.isOnline ?? false,
        isInPerson: body.isInPerson ?? true,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        registrationRequired: body.registrationRequired ?? false,
        registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : null,
        imageUrl: body.imageUrl,
        zoomMeetingId: body.zoomMeetingId,
        zoomJoinUrl: body.zoomJoinUrl,
        zoomPassword: body.zoomPassword,
        isRecurring: body.isRecurring ?? false,
        recurrenceRule: body.recurrenceRule,
        createdById: auth.user.id,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
});
