import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const seriesSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  startDate: z.string().or(z.date()).optional().nullable(),
  endDate: z.string().or(z.date()).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const series = await db.sermonSeries.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { sermons: true }
        }
      }
    });
    return NextResponse.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PASTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validation = seriesSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    const body = validation.data;

    const series = await db.sermonSeries.create({
      data: {
        name: body.name,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        startDate: body.startDate && body.startDate !== "" ? new Date(body.startDate) : null,
        endDate: body.endDate && body.endDate !== "" ? new Date(body.endDate) : null,
      },
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error('Error creating series:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to create series', 
      details: message 
    }, { status: 500 });
  }
}
