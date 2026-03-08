import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Unsubscribe via email link
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token && !email) {
      return NextResponse.json(
        { error: 'Token or email is required' },
        { status: 400 }
      );
    }

    let subscriber;
    if (token) {
      subscriber = await db.subscriber.findFirst({
        where: { verificationToken: token },
      });
    } else if (email) {
      subscriber = await db.subscriber.findUnique({
        where: { email },
      });
    }

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    if (!subscriber.isSubscribed) {
      return NextResponse.json({
        success: true,
        message: 'You are already unsubscribed',
      });
    }

    // Unsubscribe
    await db.subscriber.update({
      where: { id: subscriber.id },
      data: {
        isSubscribed: false,
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed successfully',
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
