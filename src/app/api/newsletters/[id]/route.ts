import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get a single newsletter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsletter = await db.newsletter.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(newsletter);
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter' },
      { status: 500 }
    );
  }
}

// PUT - Update a newsletter
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      subject,
      content,
      plainText,
      frequency,
      scheduledFor,
      status,
      targetAll,
      targetSegments,
    } = body;

    const newsletter = await db.newsletter.findUnique({
      where: { id },
    });

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Don't allow editing sent newsletters
    if (newsletter.status === 'sent') {
      return NextResponse.json(
        { error: 'Cannot edit a sent newsletter' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (title !== undefined) updateData.title = title;
    if (subject !== undefined) updateData.subject = subject;
    if (content !== undefined) updateData.content = content;
    if (plainText !== undefined) updateData.plainText = plainText;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (scheduledFor !== undefined) {
      updateData.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
      if (scheduledFor) {
        updateData.status = 'scheduled';
      }
    }
    if (status !== undefined) updateData.status = status;
    if (targetAll !== undefined) updateData.targetAll = targetAll;
    if (targetSegments !== undefined) updateData.targetSegments = targetSegments;

    const updated = await db.newsletter.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to update newsletter' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a newsletter
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsletter = await db.newsletter.findUnique({
      where: { id },
    });

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Don't allow deleting sending newsletters
    if (newsletter.status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot delete a newsletter that is being sent' },
        { status: 400 }
      );
    }

    // Delete associated logs first
    await db.newsletterLog.deleteMany({
      where: { newsletterId: id },
    });

    await db.newsletter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to delete newsletter' },
      { status: 500 }
    );
  }
}
