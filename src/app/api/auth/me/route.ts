import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie or header
    const token = 
      request.cookies.get('sessionToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated', authenticated: false },
        { status: 401 }
      );
    }
    
    const session = await validateSession(token);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired or invalid', authenticated: false },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      user: session.user,
      session: {
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json(
      { error: 'An error occurred', authenticated: false },
      { status: 500 }
    );
  }
}
