import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, referrer, userAgent: bodyUserAgent, userId } = body;
    
    const headersList = await headers();
    const userAgent = bodyUserAgent || headersList.get('user-agent') || 'unknown';
    const ipAddress = headersList.get('x-forwarded-for') || '127.0.0.1';

    // Simple parser for browser/os/device from user agent
    const getBrowserInfo = (ua: string) => {
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Edg')) return 'Edge';
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Safari')) return 'Safari';
      return 'Other';
    };

    const getOSInfo = (ua: string) => {
      if (ua.includes('Windows')) return 'Windows';
      if (ua.includes('Mac OS')) return 'macOS';
      if (ua.includes('Android')) return 'Android';
      if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
      if (ua.includes('Linux')) return 'Linux';
      return 'Other';
    };

    const getDeviceInfo = (ua: string) => {
      if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return 'Mobile';
      return 'Desktop';
    };

    await db.pageView.create({
      data: {
        path,
        referrer,
        browser: getBrowserInfo(userAgent),
        os: getOSInfo(userAgent),
        device: getDeviceInfo(userAgent),
        userAgent,
        ipAddress,
        userId: userId || null,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
