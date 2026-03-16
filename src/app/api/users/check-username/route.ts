import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username || username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });

    return NextResponse.json({ available: !user });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 });
  }
}
