import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  timezone: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  isOnline: z.boolean().optional(),
  isInPerson: z.boolean().optional(),
  capacity: z.union([z.number(), z.string()]).optional().nullable(),
  registrationRequired: z.boolean().optional(),
  registrationDeadline: z.string().or(z.date()).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  zoomMeetingId: z.string().optional().nullable(),
  zoomJoinUrl: z.string().optional().nullable(),
  zoomPassword: z.string().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional().nullable(),
  createdById: z.string().optional().nullable(),
});

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
          select: { id: true, name: true, email: true }
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validation = eventSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    const body = validation.data;
    
    const event = await db.event.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type || 'SERVICE',
        status: body.status || 'SCHEDULED',
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        timezone: body.timezone || 'America/New_York',
        location: body.location,
        address: body.address,
        isOnline: body.isOnline ?? false,
        isInPerson: body.isInPerson ?? true,
        capacity: body.capacity ? (typeof body.capacity === 'string' ? parseInt(body.capacity) : body.capacity) : null,
        registrationRequired: body.registrationRequired ?? false,
        registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : null,
        imageUrl: body.imageUrl,
        zoomMeetingId: body.zoomMeetingId,
        zoomJoinUrl: body.zoomJoinUrl,
        zoomPassword: body.zoomPassword,
        isRecurring: body.isRecurring ?? false,
        recurrenceRule: body.recurrenceRule,
        createdById: body.createdById || session.user.id,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
