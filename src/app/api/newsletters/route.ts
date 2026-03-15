import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List all newsletters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { subject: { contains: search } },
      ];
    }

    const [newsletters, total] = await Promise.all([
      db.newsletter.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { logs: true },
          },
        },
      }),
      db.newsletter.count({ where }),
    ]);

    return NextResponse.json({
      newsletters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletters' },
      { status: 500 }
    );
  }
}

// POST - Create a new newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      subject,
      content,
      plainText,
      frequency,
      scheduledFor,
      targetAll,
      targetSegments,
    } = body;

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!title || !subject || !content) {
      return NextResponse.json(
        { error: 'Title, subject, and content are required' },
        { status: 400 }
      );
    }

    // Get subscriber count for total recipients
    const subscriberCount = await db.subscriber.count({
      where: { isSubscribed: true, isVerified: true },
    });

    const newsletter = await db.newsletter.create({
      data: {
        title,
        subject,
        content,
        plainText,
        frequency: frequency || 'one_time',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: scheduledFor ? 'scheduled' : 'draft',
        targetAll: targetAll !== undefined ? targetAll : true,
        targetSegments,
        totalRecipients: subscriberCount,
      },
    });

    return NextResponse.json(newsletter, { status: 201 });
  } catch (error) {
    console.error('Error creating newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to create newsletter' },
      { status: 500 }
    );
  }
}
