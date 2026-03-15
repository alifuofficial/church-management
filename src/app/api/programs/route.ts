import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const programSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  dayOfWeek: z.union([z.number(), z.string()]),
  startTime: z.string().min(1),
  endTime: z.string().optional().nullable(),
  timezone: z.string().optional(),
  location: z.string().optional().nullable(),
  isOnline: z.boolean().optional(),
  zoomLink: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET - List all programs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active');

    const where: Record<string, unknown> = {};
    if (active === 'true') {
      where.isActive = true;
    }

    const programs = await db.program.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST - Create a new program
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validation = programSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    const {
      name,
      description,
      dayOfWeek,
      startTime,
      endTime,
      timezone,
      location,
      isOnline,
      zoomLink,
      isActive,
    } = validation.data;

    const program = await db.program.create({
      data: {
        name,
        description,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        timezone: timezone || 'America/New_York',
        location,
        isOnline: isOnline || false,
        zoomLink,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}
