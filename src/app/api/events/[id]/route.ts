import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth, withAdmin, AuthContext } from '@/lib/api-auth';
import { sanitizeInput } from '@/lib/auth-utils';

// GET - Retrieve single event (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const event = await db.event.findUnique({
      where: { id },
      include: {
        eventSpeakers: {
          orderBy: { order: 'asc' }
        },
        createdBy: {
          select: { id: true, name: true }
        },
        registrations: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        },
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// PUT - Update event (admin only)
export const PUT = withAdmin(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
  auth: AuthContext
) => {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const updateData: Record<string, unknown> = {};
    
    if (body.title !== undefined) updateData.title = sanitizeInput(body.title);
    if (body.description !== undefined) updateData.description = body.description ? sanitizeInput(body.description) : null;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.timezone !== undefined) updateData.timezone = body.timezone;
    if (body.location !== undefined) updateData.location = body.location ? sanitizeInput(body.location) : null;
    if (body.address !== undefined) updateData.address = body.address ? sanitizeInput(body.address) : null;
    if (body.isOnline !== undefined) updateData.isOnline = body.isOnline;
    if (body.isInPerson !== undefined) updateData.isInPerson = body.isInPerson;
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.registrationRequired !== undefined) updateData.registrationRequired = body.registrationRequired;
    if (body.registrationDeadline !== undefined) updateData.registrationDeadline = body.registrationDeadline ? new Date(body.registrationDeadline) : null;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.zoomMeetingId !== undefined) updateData.zoomMeetingId = body.zoomMeetingId;
    if (body.zoomJoinUrl !== undefined) updateData.zoomJoinUrl = body.zoomJoinUrl;
    if (body.zoomStartUrl !== undefined) updateData.zoomStartUrl = body.zoomStartUrl;
    if (body.zoomPassword !== undefined) updateData.zoomPassword = body.zoomPassword;
    if (body.isRecurring !== undefined) updateData.isRecurring = body.isRecurring;
    if (body.recurrenceRule !== undefined) updateData.recurrenceRule = body.recurrenceRule;

    const event = await db.event.update({
      where: { id },
      data: updateData,
      include: {
        eventSpeakers: true,
        _count: {
          select: { registrations: true }
        }
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
});

// DELETE - Delete event (admin only)
export const DELETE = withAdmin(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
  auth: AuthContext
) => {
  try {
    const { id } = await context.params;
    
    // Delete related records first
    await db.$transaction([
      db.eventSpeaker.deleteMany({ where: { eventId: id } }),
      db.registration.deleteMany({ where: { eventId: id } }),
      db.event.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
});
