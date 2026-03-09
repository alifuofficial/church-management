import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to generate a slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/campaigns/[id] - Get a single campaign with stats (supports both id and slug)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find by id first, then by slug
    let campaign = await db.donationCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      campaign = await db.donationCampaign.findUnique({
        where: { slug: id },
      });
    }

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get donation stats for this campaign
    const donationStats = await db.donation.aggregate({
      where: {
        campaignId: campaign.id,
        status: 'COMPLETED',
      },
      _sum: { amount: true },
      _count: true,
    });

    // Get recent donations for this campaign
    const recentDonations = await db.donation.findMany({
      where: {
        campaignId: campaign.id,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        donorName: true,
        donorEmail: true,
        createdAt: true,
        isAnonymous: true,
      },
    });

    return NextResponse.json({
      ...campaign,
      donationTotal: donationStats._sum.amount || 0,
      donationCount: donationStats._count,
      recentDonations,
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

// PUT /api/campaigns/[id] - Update a campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, goal, raised, startDate, endDate, imageUrl, isActive } = body;

    // Try to find by id first, then by slug
    let campaign = await db.donationCampaign.findUnique({ where: { id } });
    if (!campaign) {
      campaign = await db.donationCampaign.findUnique({ where: { slug: id } });
    }

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {
      updateData.name = name;
      // Also update slug if name changes
      const newSlug = generateSlug(name);
      const existingSlug = await db.donationCampaign.findUnique({ where: { slug: newSlug } });
      if (!existingSlug || existingSlug.id === campaign.id) {
        updateData.slug = newSlug;
      } else {
        // Add unique suffix
        let counter = 1;
        let uniqueSlug = `${newSlug}-${counter}`;
        while (await db.donationCampaign.findUnique({ where: { slug: uniqueSlug } })) {
          counter++;
          uniqueSlug = `${newSlug}-${counter}`;
        }
        updateData.slug = uniqueSlug;
      }
    }
    if (description !== undefined) updateData.description = description;
    if (goal !== undefined) updateData.goal = goal ? parseFloat(goal) : null;
    if (raised !== undefined) updateData.raised = parseFloat(raised);
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCampaign = await db.donationCampaign.update({
      where: { id: campaign.id },
      data: updateData,
    });

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find by id first, then by slug
    let campaign = await db.donationCampaign.findUnique({ where: { id } });
    if (!campaign) {
      campaign = await db.donationCampaign.findUnique({ where: { slug: id } });
    }

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check if there are donations associated with this campaign
    const donationsCount = await db.donation.count({
      where: { campaignId: campaign.id },
    });

    if (donationsCount > 0) {
      // Instead of deleting, mark as inactive
      const updatedCampaign = await db.donationCampaign.update({
        where: { id: campaign.id },
        data: { isActive: false },
      });
      return NextResponse.json({
        message: 'Campaign has associated donations. Marked as inactive instead.',
        campaign: updatedCampaign,
      });
    }

    await db.donationCampaign.delete({
      where: { id: campaign.id },
    });

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
