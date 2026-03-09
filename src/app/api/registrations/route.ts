import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth, withAdmin, AuthContext } from '@/lib/api-auth';

// GET - Fetch registrations (authenticated, own registrations or admin for all)
export const GET = withAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const isAdminUser = auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN';

    const where: Record<string, unknown> = {};
    
    // Non-admin users can only see their own registrations
    if (!isAdminUser) {
      where.userId = auth.user.id;
    } else if (userId) {
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
            image: true,
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
});

// POST - Create registration (authenticated)
export const POST = withAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const body = await request.json();
    
    // Check if already registered
    const existing = await db.registration.findUnique({
      where: {
        eventId_userId: {
          eventId: body.eventId,
          userId: auth.user.id,
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
        userId: auth.user.id,
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
});

// DELETE - Cancel registration (owner or admin)
export const DELETE = withAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }

    // Get the registration to check ownership
    const reg = await db.registration.findUnique({
      where: { id },
      select: { userId: true, eventId: true }
    });

    if (!reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Check if user owns the registration or is admin
    const isAdminUser = auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN';
    if (reg.userId !== auth.user.id && !isAdminUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
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
      where: { id: reg.eventId },
      data: { registrationCount: { decrement: 1 } }
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return NextResponse.json({ error: 'Failed to cancel registration' }, { status: 500 });
  }
});
