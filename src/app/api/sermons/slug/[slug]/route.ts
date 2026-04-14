import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const sermon = await db.sermon.findUnique({
      where: { slug },
      include: {
        series: true,
        _count: {
          select: { notes: true, bookmarks: true }
        }
      }
    });

    if (!sermon) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }

    return NextResponse.json(sermon);
  } catch (error) {
    console.error('Error fetching sermon by slug:', error);
    return NextResponse.json({ error: 'Failed to fetch sermon' }, { status: 500 });
  }
}
