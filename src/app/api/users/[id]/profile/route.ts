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
    if (body.username !== undefined) updateData.username = body.username;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.timezone !== undefined) updateData.timezone = body.timezone;
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.denomination !== undefined) updateData.denomination = body.denomination;
    if (body.faithStatus !== undefined) updateData.faithStatus = body.faithStatus;
    if (body.localChurch !== undefined) updateData.localChurch = body.localChurch;
    if (body.interests !== undefined) updateData.interests = body.interests;
    if (body.emailOptIn !== undefined) updateData.emailOptIn = body.emailOptIn;
    if (body.smsOptIn !== undefined) updateData.smsOptIn = body.smsOptIn;

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        image: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        country: true,
        timezone: true,
        zipCode: true,
        bio: true,
        denomination: true,
        faithStatus: true,
        localChurch: true,
        interests: true,
        emailOptIn: true,
        smsOptIn: true,
        memberSince: true,
        isVerified: true,
        acceptedTerms: true,
        acceptedPrivacy: true,
        acceptedStatementOfFaith: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
