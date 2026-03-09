import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { withAuth, withAdmin, AuthContext } from '@/lib/api-auth';
import { isValidEmail, isValidPassword, sanitizeInput } from '@/lib/auth-utils';

// GET - List users (requires authentication, admin for full list)
export const GET = withAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Non-admins can only see basic info
    const isAdminUser = auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN';

    const where: Record<string, unknown> = {};
    if (role) {
      where.role = role;
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        email: isAdminUser,
        name: true,
        role: true,
        image: true,
        phone: isAdminUser,
        city: true,
        state: true,
        memberSince: true,
        isVerified: isAdminUser,
        isActive: isAdminUser,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
});

// POST - Create user (requires admin)
export const POST = withAdmin(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }
    
    const sanitizedEmail = sanitizeInput(body.email.toLowerCase());
    const sanitizedName = sanitizeInput(body.name);
    
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Validate password
    const passwordCheck = isValidPassword(body.password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message },
        { status: 400 }
      );
    }
    
    const hashedPassword = await hash(body.password, 12);
    
    const user = await db.user.create({
      data: {
        email: sanitizedEmail,
        name: sanitizedName,
        password: hashedPassword,
        role: body.role || 'MEMBER',
        phone: body.phone ? sanitizeInput(body.phone) : null,
        city: body.city ? sanitizeInput(body.city) : null,
        state: body.state ? sanitizeInput(body.state) : null,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
});
