import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (role) {
      where.role = role;
    }

    const users = await db.user.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const hashedPassword = await hash(body.password, 12);
    
    const user = await db.user.create({
      data: {
        email: body.email,
        username: body.username,
        name: body.name,
        password: hashedPassword,
        role: body.role || 'VISITOR',
        phone: body.phone,
        city: body.city,
        state: body.state,
        country: body.country,
        timezone: body.timezone,
        denomination: body.denomination,
        faithStatus: body.faithStatus,
        localChurch: body.localChurch,
        interests: body.interests,
        acceptedTerms: body.acceptedTerms || false,
        acceptedPrivacy: body.acceptedPrivacy || false,
        acceptedStatementOfFaith: body.acceptedStatementOfFaith || false,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      const field = error.meta?.target?.includes('email') ? 'Email' : 'Username';
      return NextResponse.json({ error: `${field} already in use` }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
