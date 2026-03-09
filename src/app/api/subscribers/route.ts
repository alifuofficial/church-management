import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

// GET - List all subscribers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }
    
    if (status === 'subscribed') {
      where.isSubscribed = true;
    } else if (status === 'unsubscribed') {
      where.isSubscribed = false;
    } else if (status === 'verified') {
      where.isVerified = true;
    }

    const [subscribers, total] = await Promise.all([
      db.subscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.subscriber.count({ where }),
    ]);

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// POST - Create a new subscriber (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, source } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await db.subscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isSubscribed) {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 400 }
        );
      } else {
        // Re-subscribe
        const updated = await db.subscriber.update({
          where: { email },
          data: {
            isSubscribed: true,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            name: name || existing.name,
            phone: phone || existing.phone,
            source: source || existing.source,
            verificationToken: randomBytes(32).toString('hex'),
          },
        });
        return NextResponse.json(updated);
      }
    }

    // Create new subscriber
    const verificationToken = randomBytes(32).toString('hex');
    const subscriber = await db.subscriber.create({
      data: {
        email,
        name,
        phone,
        source: source || 'website',
        verificationToken,
      },
    });

    // TODO: Send verification email

    return NextResponse.json(subscriber, { status: 201 });
  } catch (error) {
    console.error('Error creating subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
