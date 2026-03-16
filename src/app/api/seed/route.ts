import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    // Create admin user
    const adminPassword = await hash('admin123', 12);
    const admin = await db.user.upsert({
      where: { email: 'admin@church.org' },
      update: { password: adminPassword },
      create: {
        email: 'admin@church.org',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
      },
    });

    // Create NEW admin user
    const churchAdminPassword = await hash('ChurchAdmin2026!', 12);
    const churchAdmin = await db.user.upsert({
      where: { email: 'churchadmin@church.org' },
      update: { password: churchAdminPassword },
      create: {
        email: 'churchadmin@church.org',
        name: 'Church Admin',
        password: churchAdminPassword,
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
      },
    });

    // Create pastor user
    const pastorPassword = await hash('pastor123', 12);
    const pastor = await db.user.upsert({
      where: { email: 'pastor@church.org' },
      update: { password: pastorPassword },
      create: {
        email: 'pastor@church.org',
        name: 'Pastor John Smith',
        password: pastorPassword,
        role: 'PASTOR',
        isVerified: true,
        isActive: true,
      },
    });

    // Create member user
    const memberPassword = await hash('member123', 12);
    const member = await db.user.upsert({
      where: { email: 'member@church.org' },
      update: { password: memberPassword },
      create: {
        email: 'member@church.org',
        name: 'Jane Doe',
        password: memberPassword,
        role: 'MEMBER',
        isVerified: true,
        isActive: true,
      },
    });

    // Create programs
    const programsData = [
      {
        name: 'Sunday Worship Service',
        description: 'Join us for our weekly worship service with praise, prayer, and the Word.',
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '12:00',
        location: 'Main Sanctuary',
        isOnline: true,
        zoomLink: 'https://zoom.us/j/sunday-worship',
        isActive: true,
      },
      {
        name: 'Wednesday Bible Study',
        description: 'Deep dive into Scripture with interactive discussion.',
        dayOfWeek: 3,
        startTime: '19:30',
        endTime: '21:00',
        location: 'Fellowship Hall',
        isOnline: true,
        zoomLink: 'https://zoom.us/j/bible-study',
        isActive: true,
      },
      {
        name: 'Tuesday Prayer Meeting',
        description: 'A dedicated time for corporate prayer and intercession.',
        dayOfWeek: 2,
        startTime: '19:00',
        endTime: '20:00',
        location: 'Prayer Room',
        isOnline: true,
        zoomLink: 'https://zoom.us/j/prayer-meeting',
        isActive: true,
      },
      {
        name: 'Friday Youth Night',
        description: 'Fun, fellowship, and faith for teenagers and young adults.',
        dayOfWeek: 5,
        startTime: '19:00',
        endTime: '21:00',
        location: 'Youth Center',
        isOnline: false,
        isActive: true,
      },
      {
        name: "Men's Fellowship",
        description: 'Bi-weekly gathering for men to connect, grow, and support one another.',
        dayOfWeek: 6,
        startTime: '08:00',
        endTime: '10:00',
        location: 'Church Cafeteria',
        isOnline: false,
        isActive: true,
      },
    ];

    for (const program of programsData) {
      const existing = await db.program.findFirst({ where: { name: program.name } });
      if (!existing) {
        await db.program.create({ data: program });
      }
    }

    // Create sermon series
    let series = await db.sermonSeries.findFirst({ where: { name: 'Walking in Faith' } });
    if (!series) {
      series = await db.sermonSeries.create({
        data: {
          name: 'Walking in Faith',
          description: 'A journey through the fundamentals of living a faith-filled life.',
          imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800',
        },
      });
    }

    // Create sermons
    const sermonsData = [
      {
        title: 'The Foundation of Faith',
        description: 'Understanding what it means to truly trust God in every area of life.',
        scripture: 'Hebrews 11:1-6',
        speakerName: 'Pastor John Smith',
        seriesId: series.id,
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        audioUrl: '/audio/sermon1.mp3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800',
        duration: 2400,
        publishedAt: new Date('2024-01-07'),
        isFeatured: true,
        viewCount: 1250,
        tags: 'faith,trust,foundation',
      },
      {
        title: 'Prayer That Moves Mountains',
        description: 'Discovering the power of persistent and faithful prayer.',
        scripture: 'Matthew 17:20-21',
        speakerName: 'Pastor John Smith',
        seriesId: series.id,
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        audioUrl: '/audio/sermon2.mp3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800',
        duration: 2700,
        publishedAt: new Date('2024-01-14'),
        isFeatured: false,
        viewCount: 980,
        tags: 'prayer,mountains,miracles',
      },
      {
        title: 'Walking by Faith, Not by Sight',
        description: "Learning to navigate life with spiritual eyes fixed on God's promises.",
        scripture: '2 Corinthians 5:7',
        speakerName: 'Pastor John Smith',
        seriesId: series.id,
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        audioUrl: '/audio/sermon3.mp3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800',
        duration: 2520,
        publishedAt: new Date('2024-01-21'),
        isFeatured: false,
        viewCount: 850,
        tags: 'faith,walk,spiritual',
      },
    ];

    for (const sermon of sermonsData) {
      const existing = await db.sermon.findFirst({ where: { title: sermon.title } });
      if (!existing) {
        await db.sermon.create({ data: sermon });
      }
    }

    // Create events
    const now = new Date();
    const eventsData = [
      {
        title: 'Sunday Worship Service',
        description: 'Join us for our weekly worship service with praise, prayer, and an inspiring message.',
        type: 'SERVICE' as const,
        status: 'SCHEDULED' as const,
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()), 10, 0),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()), 12, 0),
        location: 'Main Sanctuary',
        address: '123 Church Street, City, State 12345',
        isOnline: true,
        isInPerson: true,
        capacity: 500,
        registrationRequired: false,
        zoomMeetingId: '123456789',
        zoomJoinUrl: 'https://zoom.us/j/123456789',
        isRecurring: true,
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=SU',
        createdById: admin.id,
      },
      {
        title: 'Annual Church Conference 2024',
        description: 'A three-day conference featuring guest speakers, worship, and workshops for all ages.',
        type: 'CONFERENCE' as const,
        status: 'SCHEDULED' as const,
        startDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 18, 0),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 17, 21, 0),
        location: 'Main Sanctuary & Fellowship Hall',
        address: '123 Church Street, City, State 12345',
        isOnline: true,
        isInPerson: true,
        capacity: 1000,
        registrationRequired: true,
        registrationDeadline: new Date(now.getFullYear(), now.getMonth() + 1, 10),
        zoomMeetingId: '987654321',
        zoomJoinUrl: 'https://zoom.us/j/987654321',
        isRecurring: false,
        createdById: admin.id,
      },
      {
        title: 'Youth Retreat',
        description: 'A weekend getaway for teens to connect with God and each other.',
        type: 'YOUTH_NIGHT' as const,
        status: 'SCHEDULED' as const,
        startDate: new Date(now.getFullYear(), now.getMonth() + 1, 22, 16, 0),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 24, 12, 0),
        location: 'Mountain View Camp',
        address: '456 Mountain Road, Hills, State 67890',
        isOnline: false,
        isInPerson: true,
        capacity: 100,
        registrationRequired: true,
        registrationDeadline: new Date(now.getFullYear(), now.getMonth() + 1, 18),
        isRecurring: false,
        createdById: admin.id,
      },
      {
        title: 'Community Outreach Day',
        description: 'Join us as we serve our community through various service projects.',
        type: 'COMMUNITY_OUTREACH' as const,
        status: 'SCHEDULED' as const,
        startDate: new Date(now.getFullYear(), now.getMonth() + 1, 5, 9, 0),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 5, 15, 0),
        location: 'Community Center',
        address: '789 Community Drive, City, State 12345',
        isOnline: false,
        isInPerson: true,
        capacity: 200,
        registrationRequired: true,
        isRecurring: false,
        createdById: admin.id,
      },
    ];

    for (const event of eventsData) {
      const existing = await db.event.findFirst({ where: { title: event.title } });
      if (!existing) {
        await db.event.create({ data: event });
      }
    }

    // Create prayer requests
    const prayersData = [
      {
        userId: member.id,
        title: 'Healing for Family Member',
        request: 'Please pray for my mother who is recovering from surgery. She is making progress but still needs prayers for complete healing.',
        isPublic: true,
        isUrgent: false,
        status: 'IN_PROGRESS' as const,
        prayerCount: 45,
      },
      {
        userId: member.id,
        title: 'Job Search Guidance',
        request: 'I am seeking a new job opportunity and would appreciate prayers for guidance and open doors.',
        isPublic: true,
        isUrgent: false,
        status: 'PENDING' as const,
        prayerCount: 23,
      },
      {
        userId: member.id,
        title: 'Financial Breakthrough',
        request: 'Praying for financial stability and wisdom in managing resources during this challenging season.',
        isPublic: true,
        isUrgent: true,
        status: 'PENDING' as const,
        prayerCount: 67,
      },
    ];

    for (const prayer of prayersData) {
      const existing = await db.prayerRequest.findFirst({ where: { title: prayer.title } });
      if (!existing) {
        await db.prayerRequest.create({ data: prayer });
      }
    }

    // Create small groups
    const groupsData = [
      {
        name: 'Young Adults Fellowship',
        description: 'A vibrant community for young professionals and college students.',
        type: 'Age-based',
        leaderId: pastor.id,
        location: 'Church Office Building, Room 201',
        meetingDay: 'Thursday',
        meetingTime: '19:00',
        maxMembers: 25,
        isActive: true,
      },
      {
        name: "Women's Bible Study",
        description: 'Weekly study focusing on women in the Bible and their faith journeys.',
        type: 'Interest-based',
        location: 'Fellowship Hall',
        meetingDay: 'Tuesday',
        meetingTime: '10:00',
        maxMembers: 30,
        isActive: true,
      },
      {
        name: "Men's Accountability Group",
        description: 'Support and accountability for men seeking to grow in their faith.',
        type: 'Interest-based',
        leaderId: admin.id,
        location: 'Church Library',
        meetingDay: 'Saturday',
        meetingTime: '07:00',
        maxMembers: 15,
        isActive: true,
      },
    ];

    for (const group of groupsData) {
      const existing = await db.smallGroup.findFirst({ where: { name: group.name } });
      if (!existing) {
        await db.smallGroup.create({ data: group });
      }
    }

    // Create donation campaigns
    const campaignsData = [
      {
        name: 'Building Fund',
        description: 'Help us expand our facilities to better serve our community.',
        goal: 500000,
        raised: 125000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
        isActive: true,
      },
      {
        name: 'Youth Ministry',
        description: 'Support our youth programs, retreats, and activities.',
        goal: 25000,
        raised: 18750,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        imageUrl: 'https://images.unsplash.com/photo-1529390079861-591f6a4c5080?w=800',
        isActive: true,
      },
      {
        name: 'Mission Trips',
        description: 'Fund mission trips to spread the Gospel around the world.',
        goal: 75000,
        raised: 52000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
        isActive: true,
      },
    ];

    for (const campaign of campaignsData) {
      const existing = await db.donationCampaign.findFirst({ where: { name: campaign.name } });
      if (!existing) {
        await db.donationCampaign.create({ data: campaign });
      }
    }

    return NextResponse.json({ 
      message: 'Database seeded successfully!',
      users: { 
        admin: admin.email, 
        churchAdmin: churchAdmin.email,
        pastor: pastor.email, 
        member: member.email 
      },
      credentials: {
        admin: { email: 'admin@church.org', password: 'admin123' },
        churchAdmin: { email: 'churchadmin@church.org', password: 'ChurchAdmin2026!' },
        pastor: { email: 'pastor@church.org', password: 'pastor123' },
        member: { email: 'member@church.org', password: 'member123' },
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
