import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, validateSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie or header
    const token = 
      request.cookies.get('sessionToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (token) {
      await deleteSession(token);
    }
    
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Clear session cookie
    response.cookies.set('sessionToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
