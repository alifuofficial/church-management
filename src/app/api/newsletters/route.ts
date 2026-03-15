import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const newsletterSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  plainText: z.string().optional(),
  frequency: z.string().optional(),
  scheduledFor: z.string().optional(),
  targetAll: z.boolean().optional(),
  targetSegments: z.any().optional(),
});

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
    const validation = newsletterSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    const body = validation.data;

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
