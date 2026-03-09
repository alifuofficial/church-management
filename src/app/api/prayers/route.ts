import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth, withRoles, AuthContext } from '@/lib/api-auth';
import { sanitizeInput } from '@/lib/auth-utils';

// GET - Fetch prayer requests (authenticated)
// - Admins/Pastors can see all prayers
// - Regular users can only see their own prayers
export const GET = withAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const isAdminUser = auth.user.role === 'ADMIN' || auth.user.role === 'PASTOR' || auth.user.role === 'SUPER_ADMIN';

    const where: Record<string, unknown> = {};
    
    // Non-admin users can only see their own prayer requests
    if (!isAdminUser) {
      where.userId = auth.user.id;
    }
    
    if (status) {
      where.status = status;
    }

    const prayers = await db.prayerRequest.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, image: true }
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
});

// POST - Create a new prayer request (authenticated)
export const POST = withAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const body = await request.json();
    
    // Create prayer request
    const prayer = await db.prayerRequest.create({
      data: {
        userId: auth.user.id,
        title: sanitizeInput(body.title),
        request: sanitizeInput(body.request),
        isPublic: false, // Always private
        isUrgent: body.isUrgent ?? false,
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(prayer);
  } catch (error) {
    console.error('Error creating prayer request:', error);
    return NextResponse.json({ error: 'Failed to create prayer request' }, { status: 500 });
  }
});
