import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const body = await request.json();
    
    const sermon = await db.sermon.create({
      data: {
        title: body.title,
        description: body.description,
        scripture: body.scripture,
        speakerName: body.speakerName,
        seriesId: body.seriesId,
        videoUrl: body.videoUrl,
        audioUrl: body.audioUrl,
        documentUrl: body.documentUrl,
        thumbnailUrl: body.thumbnailUrl,
        duration: body.duration,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
        isFeatured: body.isFeatured ?? false,
        tags: body.tags,
      },
    });

    return NextResponse.json(sermon);
  } catch (error) {
    console.error('Error creating sermon:', error);
    return NextResponse.json({ error: 'Failed to create sermon' }, { status: 500 });
  }
}
