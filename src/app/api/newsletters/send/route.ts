import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

// POST - Send a newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newsletterId, testEmail } = body;

    const settings = await db.emailSettings.findFirst();
    if (!settings || !settings.isActive) {
      return NextResponse.json(
        { error: 'Email settings not configured or inactive' },
        { status: 400 }
      );
    }

    const newsletter = await db.newsletter.findUnique({
      where: { id: newsletterId },
    });

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Test mode - send to a single email
    if (testEmail) {
      // In production, you would actually send the email here
      // For now, we'll simulate it
      const testResult = {
        success: true,
        message: `Test email would be sent to ${testEmail}`,
        subject: newsletter.subject,
        provider: settings.provider,
      };

      return NextResponse.json(testResult);
    }

    // Get all subscribed and verified subscribers
    const subscribers = await db.subscriber.findMany({
      where: {
        isSubscribed: true,
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No subscribers to send to' },
        { status: 400 }
      );
    }

    // Update newsletter status to sending
    await db.newsletter.update({
      where: { id: newsletterId },
      data: {
        status: 'sending',
        totalRecipients: subscribers.length,
      },
    });

    // Create logs for each subscriber
    const logs = subscribers.map(subscriber => ({
      newsletterId,
      subscriberId: subscriber.id,
      email: subscriber.email,
      status: 'pending',
      trackingId: randomBytes(16).toString('hex'),
    }));

    await db.newsletterLog.createMany({
      data: logs,
    });

    // Simulate sending (in production, you would use SMTP or Mailchimp API)
    // For demo purposes, we'll just update the logs as sent
    const sentCount = await db.newsletterLog.updateMany({
      where: { newsletterId },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });

    // Update newsletter stats
    const updated = await db.newsletter.update({
      where: { id: newsletterId },
      data: {
        status: 'sent',
        sentAt: new Date(),
        sentCount: sentCount.count,
      },
    });

    return NextResponse.json({
      success: true,
      newsletter: updated,
      stats: {
        totalSent: sentCount.count,
        provider: settings.provider,
      },
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}

// GET - Get send status/logs for a newsletter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const newsletterId = searchParams.get('newsletterId');

    if (!newsletterId) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

    const newsletter = await db.newsletter.findUnique({
      where: { id: newsletterId },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Get stats
    const stats = await db.newsletterLog.groupBy({
      by: ['status'],
      where: { newsletterId },
      _count: true,
    });

    return NextResponse.json({
      newsletter,
      stats: stats.reduce((acc, s) => {
        acc[s.status] = s._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching send status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch send status' },
      { status: 500 }
    );
  }
}
