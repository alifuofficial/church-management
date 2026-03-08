import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to check if user is admin
async function getUserRole(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true }
  });
  return user?.role || null;
}

// POST - Add a response/reply to a prayer request (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const userId = body.userId;
  
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = await getUserRole(userId);
    const isAdmin = userRole === 'ADMIN' || userRole === 'PASTOR';
  
    // Only admins can respond to prayer requests
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only administrators can respond to prayer requests' }, { status: 403 });
    }

    const { id } = await params;
  
    // Verify the prayer request exists
    const prayerRequest = await db.prayerRequest.findUnique({
      where: { id }
    });
  
    if (!prayerRequest) {
      return NextResponse.json({ error: 'Prayer request not found' }, { status: 404 });
    }
  
    // Get user name for response
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });
  
    // Create the response
    const response = await db.prayerResponse.create({
      data: {
        prayerRequestId: id,
        responderName: body.responderName || user?.name || 'Prayer Team',
        message: body.message,
        isPublic: false, // Always private
      }
    });
  
    // Update the prayer count and status
    await db.prayerRequest.update({
      where: { id },
      data: {
        prayerCount: { increment: 1 },
        status: prayerRequest.status === 'PENDING' ? 'IN_PROGRESS' : prayerRequest.status
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating prayer response:', error);
    return NextResponse.json({ error: 'Failed to create response' }, { status: 500 });
  }
}

// GET - Get all responses for a prayer request (Admin or owner)
export async function GET(
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
  
    // Verify the prayer request exists and user has access
    const prayerRequest = await db.prayerRequest.findUnique({
      where: { id }
    });
  
    if (!prayerRequest) {
      return NextResponse.json({ error: 'Prayer request not found' }, { status: 404 });
    }

    // Only admins or the owner can see responses
    if (!isAdmin && prayerRequest.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  
    const responses = await db.prayerResponse.findMany({
      where: { prayerRequestId: id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}
