import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const campaignId = searchParams.get('campaignId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    
    if (userId) {
      where.userId = userId;
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
    const body = await request.json();
    
    const donation = await db.donation.create({
      data: {
        userId: body.userId,
        amount: parseFloat(body.amount),
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
