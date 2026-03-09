import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth, withAdmin, withOptionalAuth, AuthContext } from '@/lib/api-auth';
import { sanitizeInput } from '@/lib/auth-utils';

// GET - Retrieve donations (public for campaign stats, auth for user-specific)
export const GET = withOptionalAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext | null
) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const campaignId = searchParams.get('campaignId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isPublic = searchParams.get('public') === 'true';

    const where: Record<string, unknown> = {};
    
    // If requesting user-specific donations, must be that user or admin
    if (userId) {
      const isAdminUser = auth && (auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN');
      const isOwnDonations = auth && auth.user.id === userId;
      
      if (!isAdminUser && !isOwnDonations) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
      where.userId = userId;
    }
    
    if (status) {
      where.status = status;
    }
    if (campaignId) {
      where.campaignId = campaignId;
    }

    // For public requests, only show completed anonymous donations
    if (isPublic && !auth) {
      where.status = 'COMPLETED';
      where.isAnonymous = true;
    }

    const donations = await db.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        paymentMethod: true,
        isRecurring: true,
        isAnonymous: true,
        donorName: auth ? true : false,
        donorEmail: auth ? true : false,
        createdAt: true,
        campaignId: true,
        userId: auth ? true : false,
      }
    });

    return NextResponse.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
});

// POST - Create donation (requires authentication or guest donation)
export const POST = withOptionalAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext | null
) => {
  try {
    const body = await request.json();
    
    // Validate amount
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedDonorName = body.donorName ? sanitizeInput(body.donorName) : null;
    const sanitizedDonorEmail = body.donorEmail ? sanitizeInput(body.donorEmail?.toLowerCase()) : null;
    const sanitizedNotes = body.notes ? sanitizeInput(body.notes) : null;
    
    const donation = await db.donation.create({
      data: {
        userId: auth?.user.id || body.userId || null,
        amount,
        currency: body.currency || 'USD',
        status: body.status || 'PENDING',
        paymentMethod: sanitizeInput(body.paymentMethod || ''),
        transactionId: body.transactionId || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isRecurring: body.isRecurring ?? false,
        recurringInterval: body.recurringInterval,
        isAnonymous: body.isAnonymous ?? false,
        donorName: sanitizedDonorName,
        donorEmail: sanitizedDonorEmail,
        notes: sanitizedNotes,
        campaignId: body.campaignId,
      },
    });

    // Update campaign raised amount if campaignId is provided and donation is completed
    if (body.campaignId && body.status === 'COMPLETED') {
      await db.donationCampaign.update({
        where: { id: body.campaignId },
        data: {
          raised: {
            increment: amount,
          },
        },
      });
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 });
  }
});
