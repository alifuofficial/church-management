import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const sermonSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  scripture: z.string().optional(),
  speakerName: z.string().min(1, "Speaker name is required"),
  seriesId: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  audioUrl: z.string().optional().nullable(),
  documentUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  duration: z.union([z.string(), z.number()]).optional().nullable(),
  publishedAt: z.string().or(z.date()).optional().nullable(),
  isFeatured: z.boolean().optional(),
  tags: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const seriesId = searchParams.get('seriesId');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { speakerName: { contains: search } },
        { scripture: { contains: search } },
      ];
    }
    if (seriesId && seriesId !== 'all') {
      where.seriesId = seriesId;
    }
    if (featured === 'true') {
      where.isFeatured = true;
    }

    const sermons = await db.sermon.findMany({
      where,
      include: {
        series: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(sermons);
  } catch (error) {
    console.error('Error fetching sermons:', error);
    return NextResponse.json({ error: 'Failed to fetch sermons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PASTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validation = sermonSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    const body = validation.data;
    
    const sermon = await db.sermon.create({
      data: {
        title: body.title,
        description: body.description || null,
        scripture: body.scripture || null,
        speakerName: body.speakerName,
        seriesId: body.seriesId || null,
        videoUrl: body.videoUrl || null,
        audioUrl: body.audioUrl || null,
        documentUrl: body.documentUrl || null,
        thumbnailUrl: body.thumbnailUrl || null,
        duration: body.duration ? parseInt(body.duration.toString()) : null,
        publishedAt: body.publishedAt && body.publishedAt !== "" ? new Date(body.publishedAt) : new Date(),
        isFeatured: body.isFeatured ?? false,
        tags: body.tags || null,
      },
    });

    return NextResponse.json(sermon);
  } catch (error) {
    console.error('Error creating sermon:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to create sermon', 
      details: message 
    }, { status: 500 });
  }
}
