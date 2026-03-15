import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const donationSchema = z.object({
  userId: z.string().optional(),
  amount: z.union([z.number(), z.string()]),
  currency: z.string().optional(),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  donorName: z.string().optional(),
  donorEmail: z.string().optional(),
  notes: z.string().optional(),
  campaignId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const campaignId = searchParams.get('campaignId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    
    // Authorization logic:
    // 1. Admins can see everything
    // 2. Regular users can only see their own (explicitly filtered by session id)
    if (session.user.role === 'ADMIN') {
      if (userId) {
        where.userId = userId;
      }
    } else {
      where.userId = session.user.id;
    }
    if (status) {
      where.status = status;
    }
    if (campaignId) {
      where.campaignId = campaignId;
    }

    const donations = await db.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const validation = donationSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    const body = validation.data;
    
    const donation = await db.donation.create({
      data: {
        userId: body.userId,
        amount: typeof body.amount === 'string' ? parseFloat(body.amount) : body.amount,
        currency: body.currency || 'USD',
        status: body.status || 'COMPLETED',
        paymentMethod: body.paymentMethod,
        transactionId: body.transactionId || `txn_${Date.now()}`,
        isRecurring: body.isRecurring ?? false,
        recurringInterval: body.recurringInterval,
        isAnonymous: body.isAnonymous ?? false,
        donorName: body.donorName,
        donorEmail: body.donorEmail,
        notes: body.notes,
        campaignId: body.campaignId,
      },
    });

    // Update campaign raised amount if campaignId is provided
    if (body.campaignId && body.status !== 'FAILED') {
      await db.donationCampaign.update({
        where: { id: body.campaignId },
        data: {
          raised: {
            increment: parseFloat(body.amount),
          },
        },
      });
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 });
  }
}
