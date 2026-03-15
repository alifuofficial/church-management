import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const prayerSchema = z.object({
  title: z.string().min(1),
  request: z.string().min(1),
  isUrgent: z.boolean().optional(),
});

// GET - Fetch prayer requests
// - Admins/Pastors can see all prayers
// - Regular users can only see their own prayers
// Authentication is done via userId parameter (from client-side auth)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'PASTOR';

    const where: Record<string, unknown> = {};
    
    // IMPORTANT: Non-admin users can only see their own prayer requests
    // Admins can see ALL prayers (no userId filter for admins)
    if (!isAdmin) {
      where.userId = session.user.id;
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validation = prayerSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    const body = validation.data;
    
    // Create prayer request (always private)
    const prayer = await db.prayerRequest.create({
      data: {
        userId: session.user.id,
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
