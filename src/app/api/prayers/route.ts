import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch prayer requests
// - Admins/Pastors can see all prayers
// - Regular users can only see their own prayers
// Authentication is done via userId parameter (from client-side auth)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // userId is required for authentication
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required - userId is required' }, { status: 401 });
    }

    // Fetch user to get role
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'PASTOR';

    const where: Record<string, unknown> = {};
    
    // IMPORTANT: Non-admin users can only see their own prayer requests
    // Admins can see ALL prayers (no userId filter for admins)
    if (!isAdmin) {
      where.userId = userId;
    }
    
    if (status) {
      where.status = status;
    }

    const prayers = await db.prayerRequest.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, image: true, email: true }
        },
        responses: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(prayers);
  } catch (error) {
    console.error('Error fetching prayers:', error);
    return NextResponse.json({ error: 'Failed to fetch prayers' }, { status: 500 });
  }
}

// POST - Create a new prayer request (Authenticated users)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId;
    
    // userId is required
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - userId is required' }, { status: 401 });
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Create prayer request (always private)
    const prayer = await db.prayerRequest.create({
      data: {
        userId: userId,
        title: body.title,
        request: body.request,
        isPublic: false, // Always private
        isUrgent: body.isUrgent ?? false,
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(prayer);
  } catch (error) {
    console.error('Error creating prayer request:', error);
    return NextResponse.json({ error: 'Failed to create prayer request' }, { status: 500 });
  }
}
