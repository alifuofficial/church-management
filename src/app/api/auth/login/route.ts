import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { compare } from 'bcryptjs';
import { createSession } from '@/lib/session';
import { checkRateLimit, getClientIP, isValidEmail } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`login_${clientIP}`, 5, 60000); // 5 attempts per minute
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.', retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000) },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        phone: true,
        city: true,
        state: true,
        memberSince: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        password: true,
      },
    });

    // Generic error message to prevent user enumeration
    const invalidCredentials = 'Invalid email or password';

    if (!user) {
      return NextResponse.json(
        { error: invalidCredentials },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.isActive === false) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: invalidCredentials },
        { status: 401 }
      );
    }

    // Create session
    const session = await createSession(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    // Create response with session cookie
    const response = NextResponse.json({
      user: userWithoutPassword,
      session: {
        expiresAt: session.expiresAt,
      },
    });
    
    // Set HTTP-only cookie for session token
    response.cookies.set('sessionToken', session.token, {
      httpOnly: true,
      secure: false, // Allow in development
      sameSite: 'lax',
      expires: session.expiresAt,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
