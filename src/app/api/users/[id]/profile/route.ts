import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData: Record<string, unknown> = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.emailOptIn !== undefined) updateData.emailOptIn = body.emailOptIn;
    if (body.smsOptIn !== undefined) updateData.smsOptIn = body.smsOptIn;

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        bio: true,
        emailOptIn: true,
        smsOptIn: true,
        memberSince: true,
        isVerified: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
