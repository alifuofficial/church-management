import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const body = await request.json();
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
    } = body;

    if (!name || dayOfWeek === undefined || !startTime) {
      return NextResponse.json(
        { error: 'Name, day of week, and start time are required' },
        { status: 400 }
      );
    }

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
