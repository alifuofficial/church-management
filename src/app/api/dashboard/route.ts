import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get all counts
    const [
      totalMembers,
      activeMembers,
      totalEvents,
      totalSermons,
      upcomingEvents,
      liveEvents,
      pendingPrayers,
      answeredPrayers,
      recentRegistrations,
      totalGroups,
      activeGroups,
      donations,
      allDonations,
      totalVisitors
    ] = await Promise.all([
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { isActive: true, isVerified: true } }),
      db.event.count({ where: { status: 'SCHEDULED' } }),
      db.sermon.count(),
      db.event.count({ where: { startDate: { gte: new Date() } } }),
      db.event.count({ where: { status: 'LIVE' } }),
      db.prayerRequest.count({ where: { status: 'PENDING' } }),
      db.prayerRequest.count({ where: { status: 'ANSWERED' } }),
      db.registration.count({
        where: {
          registeredAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      db.smallGroup.count(),
      db.smallGroup.count({ where: { isActive: true } }),
      db.donation.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      db.donation.findMany({
        where: { status: 'COMPLETED' }
      }),
      db.user.count({ where: { role: 'VISITOR' } })
    ]);

    const monthlyGiving = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonationAmount = allDonations.reduce((sum, d) => sum + d.amount, 0);

    // Get monthly donation data for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyDonations = await db.donation.groupBy({
      by: ['createdAt'],
      where: {
        status: 'COMPLETED',
        createdAt: { gte: sixMonthsAgo }
      },
      _sum: { amount: true },
      _count: true
    });

    // Get member growth data (last 6 months)
    const memberGrowth = await db.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sixMonthsAgo }
      },
      _count: true
    });

    // Get event type distribution
    const eventsByType = await db.event.groupBy({
      by: ['type'],
      _count: true
    });

    // Get user role distribution
    const usersByRole = await db.user.groupBy({
      by: ['role'],
      _count: true
    });

    // Get prayer status distribution
    const prayersByStatus = await db.prayerRequest.groupBy({
      by: ['status'],
      _count: true
    });

    // Get registration status distribution
    const registrationsByStatus = await db.registration.groupBy({
      by: ['status'],
      _count: true
    });

    // Get small group members count
    const groupMembers = await db.smallGroupMember.count();
    
    // Get top events by registration
    const topEvents = await db.event.findMany({
      take: 5,
      orderBy: { registrationCount: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        registrationCount: true,
        startDate: true
      }
    });

    // Get recent members
    const recentMembers = await db.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        isActive: true
      }
    });

    // Get popular sermons
    const popularSermons = await db.sermon.findMany({
      take: 5,
      orderBy: { viewCount: 'desc' },
      select: {
        id: true,
        title: true,
        speakerName: true,
        viewCount: true,
        downloadCount: true,
        publishedAt: true
      }
    });

    // Get recent donations
    const recentDonations = await db.donation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: { status: 'COMPLETED' },
      select: {
        id: true,
        amount: true,
        donorName: true,
        createdAt: true,
        isRecurring: true
      }
    });

    // Get upcoming events
    const upcomingEventsList = await db.event.findMany({
      take: 5,
      where: { startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      select: {
        id: true,
        title: true,
        type: true,
        startDate: true,
        location: true,
        isOnline: true,
        registrationCount: true
      }
    });

    // Get small groups with member counts
    const smallGroups = await db.smallGroup.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        location: true,
        meetingDay: true,
        _count: {
          select: { members: true }
        }
      }
    });

    // Get user-specific data if userId provided
    let userRegistrations = [];
    let userDonations = [];
    let userPrayers = [];

    if (userId) {
      [userRegistrations, userDonations, userPrayers] = await Promise.all([
        db.registration.findMany({
          where: {
            userId,
            event: { startDate: { gte: new Date() } }
          },
          include: { event: true },
          orderBy: { registeredAt: 'desc' },
          take: 5
        }),
        db.donation.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),
        db.prayerRequest.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      ]);
    }

    // Process monthly data for charts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const donationChartData = months.map((month, i) => {
      const monthDonations = monthlyDonations.filter(d => 
        new Date(d.createdAt).getMonth() === i
      );
      return {
        month,
        amount: monthDonations.reduce((sum, d) => sum + (d._sum.amount || 0), 0),
        donors: monthDonations.reduce((sum, d) => sum + d._count, 0)
      };
    });

    const memberGrowthData = months.map((month, i) => {
      const monthMembers = memberGrowth.filter(m => 
        new Date(m.createdAt).getMonth() === i
      );
      return {
        month,
        newMembers: monthMembers.reduce((sum, m) => sum + m._count, 0)
      };
    });

    return NextResponse.json({
      stats: {
        totalMembers,
        activeMembers,
        totalEvents,
        totalSermons,
        upcomingEvents,
        liveEvents,
        pendingPrayers,
        answeredPrayers,
        recentRegistrations,
        monthlyGiving,
        totalDonationAmount,
        totalDonations: donations.length,
        totalGroups,
        activeGroups,
        groupMembers,
        totalVisitors
      },
      charts: {
        donationTrends: donationChartData,
        memberGrowth: memberGrowthData,
        eventsByType: eventsByType.map(e => ({ name: e.type.replace('_', ' '), value: e._count })),
        usersByRole: usersByRole.map(u => ({ name: u.role, value: u._count })),
        prayersByStatus: prayersByStatus.map(p => ({ name: p.status.replace('_', ' '), value: p._count })),
        registrationsByStatus: registrationsByStatus.map(r => ({ name: r.status, value: r._count }))
      },
      topEvents,
      recentMembers,
      popularSermons,
      recentDonations,
      upcomingEvents: upcomingEventsList,
      smallGroups,
      userRegistrations,
      userDonations,
      userPrayers
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
