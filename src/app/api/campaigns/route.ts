import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  goal: z.union([z.number(), z.string()]).optional().nullable(),
  raised: z.union([z.number(), z.string()]).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Helper function to generate a slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to generate unique slug
async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (await db.donationCampaign.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// GET /api/campaigns - Get all campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const includeStats = searchParams.get('stats') === 'true';
    const publicOnly = searchParams.get('public') === 'true';

    const where: Record<string, unknown> = {};
    if (activeOnly) where.isActive = true;

    const campaigns = await db.donationCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // If stats requested, get donation counts for each campaign
    let campaignsStats = campaigns.map(c => ({
      ...c,
      donationTotal: c.raised || 0,
      donationCount: 0,
    }));
    
    if (includeStats && campaigns.length > 0) {
      const donationStats = await db.donation.groupBy({
        by: ['campaignId'],
        where: {
          status: 'COMPLETED',
          campaignId: { in: campaigns.map(c => c.id) },
        },
        _sum: { amount: true },
        _count: true,
      });

      const statsMap = new Map<string, { total: number; count: number }>(
        donationStats.map(s => [s.campaignId as string, { total: s._sum.amount || 0, count: s._count }])
      );

      campaignsStats = campaigns.map(c => ({
        ...c,
        donationTotal: statsMap.get(c.id)?.total || c.raised || 0,
        donationCount: statsMap.get(c.id)?.count || 0,
      }));
    }

    // For public API, only return active campaigns with essential fields
    if (publicOnly) {
      return NextResponse.json(campaignsStats
        .filter(c => c.isActive)
        .map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          goal: c.goal,
          raised: c.donationTotal,
          imageUrl: c.imageUrl,
          startDate: c.startDate,
          endDate: c.endDate,
        }))
      );
    }

    return NextResponse.json(campaignsStats);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validation = campaignSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    const { name, description, goal, raised, startDate, endDate, imageUrl, isActive } = validation.data;

    if (!name) {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(name);

    const campaign = await db.donationCampaign.create({
      data: {
        name,
        slug,
        description,
        goal: goal ? parseFloat(goal) : null,
        raised: raised ? parseFloat(raised) : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        imageUrl,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
