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
    if (body.acceptedTerms !== undefined) updateData.acceptedTerms = body.acceptedTerms;
    if (body.acceptedPrivacy !== undefined) updateData.acceptedPrivacy = body.acceptedPrivacy;
    if (body.acceptedStatementOfFaith !== undefined) updateData.acceptedStatementOfFaith = body.acceptedStatementOfFaith;
    
    // Faith Background
    if (body.faithStatusDetail !== undefined) updateData.faithStatusDetail = body.faithStatusDetail;
    if (body.believesInSalvation !== undefined) updateData.believesInSalvation = body.believesInSalvation;
    if (body.confessedChrist !== undefined) updateData.confessedChrist = body.confessedChrist;
    if (body.completedDiscipleship !== undefined) updateData.completedDiscipleship = body.completedDiscipleship;
    if (body.baptisedWater !== undefined) updateData.baptisedWater = body.baptisedWater;
    if (body.baptisedSpirit !== undefined) updateData.baptisedSpirit = body.baptisedSpirit;
    if (body.attendingLocalChurch !== undefined) updateData.attendingLocalChurch = body.attendingLocalChurch;
    if (body.notMemberReason !== undefined) updateData.notMemberReason = body.notMemberReason;
    
    // Service & Ministry
    if (body.currentlyServing !== undefined) updateData.currentlyServing = body.currentlyServing;
    if (body.ministryInterests !== undefined) updateData.ministryInterests = body.ministryInterests;
    if (body.giftsStrengths !== undefined) updateData.giftsStrengths = body.giftsStrengths;
    
    // Follow-up & Prayer
    if (body.prayerSupportArea !== undefined) updateData.prayerSupportArea = body.prayerSupportArea;
    if (body.spiritualGrowthArea !== undefined) updateData.spiritualGrowthArea = body.spiritualGrowthArea;
    if (body.contactPreference !== undefined) updateData.contactPreference = body.contactPreference;
    if (body.mentorshipInterest !== undefined) updateData.mentorshipInterest = body.mentorshipInterest;
    if (body.dataConsent !== undefined) updateData.dataConsent = body.dataConsent;

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
        // New fields
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
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
