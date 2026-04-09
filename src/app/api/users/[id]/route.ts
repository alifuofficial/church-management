import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const user = await db.user.findUnique({
      where: { id },
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
        memberSince: true,
        isVerified: true,
        isActive: true,
        emailOptIn: true,
        smsOptIn: true,
        createdAt: true,
        // Ministry Registration Fields
        faithStatusDetail: true,
        believesInSalvation: true,
        confessedChrist: true,
        completedDiscipleship: true,
        baptisedWater: true,
        baptisedSpirit: true,
        attendingLocalChurch: true,
        notMemberReason: true,
        currentlyServing: true,
        ministryInterests: true,
        giftsStrengths: true,
        prayerSupportArea: true,
        spiritualGrowthArea: true,
        contactPreference: true,
        mentorshipInterest: true,
        dataConsent: true,
        _count: {
          select: {
            registrations: true,
            donations: true,
            prayerRequests: true,
            smallGroupMembers: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData: Record<string, unknown> = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isVerified !== undefined) updateData.isVerified = body.isVerified;
    if (body.emailOptIn !== undefined) updateData.emailOptIn = body.emailOptIn;
    if (body.smsOptIn !== undefined) updateData.smsOptIn = body.smsOptIn;
    if (body.image !== undefined) updateData.image = body.image;
    
    if (body.password) {
      updateData.password = await hash(body.password, 12);
    }

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
        memberSince: true,
        isVerified: true,
        isActive: true,
        emailOptIn: true,
        smsOptIn: true,
        createdAt: true,
        // Ministry Registration Fields
        faithStatusDetail: true,
        believesInSalvation: true,
        confessedChrist: true,
        completedDiscipleship: true,
        baptisedWater: true,
        baptisedSpirit: true,
        attendingLocalChurch: true,
        notMemberReason: true,
        currentlyServing: true,
        ministryInterests: true,
        giftsStrengths: true,
        prayerSupportArea: true,
        spiritualGrowthArea: true,
        contactPreference: true,
        mentorshipInterest: true,
        dataConsent: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First delete related records
    await db.$transaction([
      db.notification.deleteMany({ where: { userId: id } }),
      db.sermonBookmark.deleteMany({ where: { userId: id } }),
      db.sermonNote.deleteMany({ where: { userId: id } }),
      db.smallGroupMember.deleteMany({ where: { userId: id } }),
      db.prayerResponse.deleteMany({ where: { prayerRequest: { userId: id } } }),
      db.prayerRequest.deleteMany({ where: { userId: id } }),
      db.registration.deleteMany({ where: { userId: id } }),
      db.donation.updateMany({ 
        where: { userId: id }, 
        data: { userId: null } 
      }),
      db.user.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
