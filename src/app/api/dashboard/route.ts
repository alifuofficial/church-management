import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Optimized: Get all counts and sums using aggregate where possible
    const [
      totalMembers,
      activeMembers,
      totalEvents,
      totalSermons,
      upcomingEventsCount,
      liveEvents,
      pendingPrayers,
      answeredPrayers,
      recentRegistrations,
      totalGroups,
      activeGroups,
      monthlyGivingResult,
      totalDonationResult,
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
      db.donation.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true },
        _count: true
      }),
      db.donation.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      db.user.count({ where: { role: 'VISITOR' } })
    ]);

    const monthlyGiving = monthlyGivingResult._sum.amount || 0;
    const totalDonationsCount = monthlyGivingResult._count || 0;
    const totalDonationAmount = totalDonationResult._sum.amount || 0;

    // Get chart data more efficiently
    const now = new Date();
    const months: Array<{ name: string; start: Date; end: Date }> = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate last 6 months data
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: monthNames[d.getMonth()],
        start: d,
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      });
    }

    // Fetch data for each month in parallel
    const chartDataResults = await Promise.all(months.map(async (month) => {
      const [donationAgg, memberCount] = await Promise.all([
        db.donation.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: month.start, lte: month.end }
          },
          _sum: { amount: true },
          _count: true
        }),
        db.user.count({
          where: {
            createdAt: { gte: month.start, lte: month.end }
          }
        })
      ]);

      return {
        month: month.name,
        donationAmount: donationAgg._sum.amount || 0,
        donors: donationAgg._count || 0,
        newMembers: memberCount
      };
    }));

    const donationChartData = chartDataResults.map(r => ({
      month: r.month,
      amount: r.donationAmount,
      donors: r.donors
    }));

    const memberGrowthData = chartDataResults.map(r => ({
      month: r.month,
      newMembers: r.newMembers
    }));

    // Get distributions using groupBy
    const [
      eventsByType,
      usersByRole,
      prayersByStatus,
      registrationsByStatus
    ] = await Promise.all([
      db.event.groupBy({ by: ['type'], _count: true }),
      db.user.groupBy({ by: ['role'], _count: true }),
      db.prayerRequest.groupBy({ by: ['status'], _count: true }),
      db.registration.groupBy({ by: ['status'], _count: true })
    ]);

    // Get group members count
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
    let userGroups = [];

    if (userId) {
      const results = await Promise.all([
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
        }),
        db.smallGroupMember.findMany({
          where: { userId },
          include: {
            group: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        image: true,
                        email: true
                      }
                    }
                  }
                },
                leader: {
                  select: {
                    id: true,
                    name: true,
                    image: true
                  }
                }
              }
            }
          }
        })
      ]);
      userRegistrations = results[0];
      userDonations = results[1];
      userPrayers = results[2];
      userGroups = results[3].map(membership => membership.group);
    }

    return NextResponse.json({
      stats: {
        totalMembers,
        activeMembers,
        totalEvents,
        totalSermons,
        upcomingEvents: upcomingEventsCount,
        liveEvents,
        pendingPrayers,
        answeredPrayers,
        recentRegistrations,
        monthlyGiving,
        totalDonationAmount,
        totalDonations: totalDonationsCount,
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
      userPrayers,
      userGroups
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
