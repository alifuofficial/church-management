import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const sermon = await db.sermon.findUnique({
      where: { id },
      include: {
        series: true,
        notes: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
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
    console.error('Error fetching sermon:', error);
    return NextResponse.json({ error: 'Failed to fetch sermon' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PASTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const updateData: Record<string, unknown> = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.scripture !== undefined) updateData.scripture = body.scripture;
    if (body.speakerName !== undefined) updateData.speakerName = body.speakerName;
    if (body.seriesId !== undefined) updateData.seriesId = body.seriesId;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.audioUrl !== undefined) updateData.audioUrl = body.audioUrl;
    if (body.documentUrl !== undefined) updateData.documentUrl = body.documentUrl;
    if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.publishedAt !== undefined) updateData.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.viewCount !== undefined) updateData.viewCount = body.viewCount;
    if (body.downloadCount !== undefined) updateData.downloadCount = body.downloadCount;

    const sermon = await db.sermon.update({
      where: { id },
      data: updateData,
      include: {
        series: true
      }
    });

    return NextResponse.json(sermon);
  } catch (error) {
    console.error('Error updating sermon:', error);
    return NextResponse.json({ error: 'Failed to update sermon' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PASTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Delete related records first
    await db.$transaction([
      db.sermonNote.deleteMany({ where: { sermonId: id } }),
      db.sermonBookmark.deleteMany({ where: { sermonId: id } }),
      db.sermon.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sermon:', error);
    return NextResponse.json({ error: 'Failed to delete sermon' }, { status: 500 });
  }
}
