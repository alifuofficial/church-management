import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to check if user is admin
async function getUserRole(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  return user?.role || null;
}

// GET - Get a single prayer request with all responses
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
  
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const userRole = await getUserRole(userId);
    const isAdmin = userRole === 'ADMIN' || userRole === 'PASTOR';
    
    const prayer = await db.prayerRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        },
        responses: {
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!prayer) {
      return NextResponse.json({ error: 'Prayer request not found' }, { status: 404 });
    }

    // Check if user has access (admin or owner)
    if (!isAdmin && prayer.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(prayer);
  } catch (error) {
    console.error('Error fetching prayer:', error);
    return NextResponse.json({ error: 'Failed to fetch prayer' }, { status: 500 });
  }
}

// PUT - Update prayer request status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
  
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const userRole = await getUserRole(userId);
    const isAdmin = userRole === 'ADMIN' || userRole === 'PASTOR';
    
    // Check if prayer exists
    const existingPrayer = await db.prayerRequest.findUnique({
      where: { id }
    });

    if (!existingPrayer) {
      return NextResponse.json({ error: 'Prayer request not found' }, { status: 404 });
    }

    // Only admins can update status
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only administrators can update prayer request status' }, { status: 403 });
    }
    
    const updateData: Record<string, unknown> = {};
    
    if (body.status) {
      updateData.status = body.status;
      
      // If marking as answered, set the answeredAt date
      if (body.status === 'ANSWERED') {
        updateData.answeredAt = new Date();
      }
    }
    
    if (body.testimony !== undefined) {
      updateData.testimony = body.testimony;
    }
    
    if (body.prayerCount !== undefined) {
      updateData.prayerCount = body.prayerCount;
    }

    const prayer = await db.prayerRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(prayer);
  } catch (error) {
    console.error('Error updating prayer:', error);
    return NextResponse.json({ error: 'Failed to update prayer' }, { status: 500 });
  }
}

// DELETE - Delete a prayer request (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
  
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userRole = await getUserRole(userId);
    const isAdmin = userRole === 'ADMIN' || userRole === 'PASTOR';
    
    // Check if prayer exists
    const existingPrayer = await db.prayerRequest.findUnique({
      where: { id }
    });

    if (!existingPrayer) {
      return NextResponse.json({ error: 'Prayer request not found' }, { status: 404 });
    }

    // Only admins can delete prayers
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only administrators can delete prayer requests' }, { status: 403 });
    }
    
    // First delete all responses
    await db.prayerResponse.deleteMany({
      where: { prayerRequestId: id }
    });
    
    // Then delete the prayer request
    await db.prayerRequest.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Prayer request deleted' });
  } catch (error) {
    console.error('Error deleting prayer:', error);
    return NextResponse.json({ error: 'Failed to delete prayer' }, { status: 500 });
  }
}
